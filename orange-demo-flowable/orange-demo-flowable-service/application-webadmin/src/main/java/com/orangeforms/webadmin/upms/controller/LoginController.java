package com.orangeforms.webadmin.upms.controller;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.serializer.SerializerFeature;
import com.anji.captcha.model.common.ResponseModel;
import com.anji.captcha.model.vo.CaptchaVO;
import com.anji.captcha.service.CaptchaService;
import com.github.xiaoymin.knife4j.annotations.ApiSupport;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import lombok.extern.slf4j.Slf4j;
import com.orangeforms.webadmin.config.ApplicationConfig;
import com.orangeforms.webadmin.upms.service.*;
import com.orangeforms.webadmin.upms.model.*;
import com.orangeforms.webadmin.upms.model.constant.SysUserStatus;
import com.orangeforms.webadmin.upms.model.constant.SysUserType;
import com.orangeforms.webadmin.upms.model.constant.SysMenuType;
import com.orangeforms.webadmin.upms.model.constant.SysOnlineMenuPermType;
import com.orangeforms.common.online.util.OnlineUtil;
import com.orangeforms.common.online.model.OnlineDatasource;
import com.orangeforms.common.online.service.OnlineDatasourceService;
import com.orangeforms.common.online.api.config.OnlineApiProperties;
import com.orangeforms.common.core.annotation.NoAuthInterface;
import com.orangeforms.common.core.annotation.MyRequestBody;
import com.orangeforms.common.core.constant.ApplicationConstant;
import com.orangeforms.common.core.constant.ErrorCodeEnum;
import com.orangeforms.common.core.object.*;
import com.orangeforms.common.core.util.*;
import com.orangeforms.common.core.upload.*;
import com.orangeforms.common.redis.cache.SessionCacheHelper;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.redisson.api.RBucket;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * 登录接口控制器类。
 *
 * @author Jerry
 * @date 2021-06-06
 */
@ApiSupport(order = 1)
@Api(tags = "用户登录接口")
@Slf4j
@RestController
@RequestMapping("/admin/upms/login")
public class LoginController {

    @Autowired
    private SysUserService sysUserService;
    @Autowired
    private SysMenuService sysMenuService;
    @Autowired
    private SysPermCodeService sysPermCodeService;
    @Autowired
    private SysPermService sysPermService;
    @Autowired
    private SysPostService sysPostService;
    @Autowired
    private SysRoleService sysRoleService;
    @Autowired
    private SysDataPermService sysDataPermService;
    @Autowired
    private OnlineDatasourceService onlineDatasourceService;
    @Autowired
    private OnlineApiProperties onlineProperties;
    @Autowired
    private ApplicationConfig appConfig;
    @Autowired
    private RedissonClient redissonClient;
    @Autowired
    private SessionCacheHelper cacheHelper;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private CaptchaService captchaService;
    @Autowired
    private UpDownloaderFactory upDownloaderFactory;

    /**
     * 登录接口。
     *
     * @param loginName           登录名。
     * @param password            密码。
     * @param captchaVerification 验证码。
     * @return 应答结果对象，其中包括JWT的Token数据，以及菜单列表。
     */
    @ApiImplicitParams({
            // 这里包含密码密文，仅用于方便开发期间的接口测试，集成测试和发布阶段，需要将当前注解去掉。
            // 如果您重新生成了公钥和私钥，请替换password的缺省值。
            @ApiImplicitParam(name = "loginName", defaultValue = "admin"),
            @ApiImplicitParam(name = "password", defaultValue = "IP3ccke3GhH45iGHB5qP9p7iZw6xUyj28Ju10rnBiPKOI35sc%2BjI7%2FdsjOkHWMfUwGYGfz8ik31HC2Ruk%2Fhkd9f6RPULTHj7VpFdNdde2P9M4mQQnFBAiPM7VT9iW3RyCtPlJexQ3nAiA09OqG%2F0sIf1kcyveSrulxembARDbDo%3D"),
            @ApiImplicitParam(name = "captchaVerification", defaultValue = "为了方便测试，这里可以修改一下代码，hardcode一个每次都ok的验证码")
    })
    @NoAuthInterface
    @PostMapping("/doLogin")
    public ResponseResult<JSONObject> doLogin(
            @MyRequestBody String loginName,
            @MyRequestBody String password,
            @MyRequestBody String captchaVerification) throws Exception {
        if (MyCommonUtil.existBlankArgument(loginName, password, captchaVerification)) {
            return ResponseResult.error(ErrorCodeEnum.ARGUMENT_NULL_EXIST);
        }
        String errorMessage;
        CaptchaVO captchaVO = new CaptchaVO();
        captchaVO.setCaptchaVerification(captchaVerification);
        ResponseModel response = captchaService.verification(captchaVO);
        if (!response.isSuccess()) {
            //验证码校验失败，返回信息告诉前端
            //repCode  0000  无异常，代表成功
            //repCode  9999  服务器内部异常
            //repCode  0011  参数不能为空
            //repCode  6110  验证码已失效，请重新获取
            //repCode  6111  验证失败
            //repCode  6112  获取验证码失败,请联系管理员
            errorMessage = String.format("数据验证失败，验证码错误，错误码 [%s] 错误信息 [%s]",
            response.getRepCode(), response.getRepMsg());
            return ResponseResult.error(ErrorCodeEnum.DATA_VALIDATED_FAILED, errorMessage);
        }
        SysUser user = sysUserService.getSysUserByLoginName(loginName);
        password = URLDecoder.decode(password, StandardCharsets.UTF_8.name());
        // NOTE: 第一次使用时，请务必阅读ApplicationConstant.PRIVATE_KEY的代码注释。
        // 执行RsaUtil工具类中的main函数，可以生成新的公钥和私钥。
        password = RsaUtil.decrypt(password, ApplicationConstant.PRIVATE_KEY);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseResult.error(ErrorCodeEnum.INVALID_USERNAME_PASSWORD);
        }
        if (user.getUserStatus() == SysUserStatus.STATUS_LOCKED) {
            errorMessage = "登录失败，用户账号被锁定！";
            return ResponseResult.error(ErrorCodeEnum.INVALID_USER_STATUS, errorMessage);
        }
        JSONObject jsonData = this.buildLoginData(user);
        return ResponseResult.success(jsonData);
    }

    /**
     * 登出操作。同时将Session相关的信息从缓存中删除。
     *
     * @return 应答结果对象。
     */
    @PostMapping("/doLogout")
    public ResponseResult<Void> doLogout() {
        TokenData tokenData = TokenData.takeFromRequest();
        String sessionIdKey = RedisKeyUtil.makeSessionIdKey(tokenData.getSessionId());
        redissonClient.getBucket(sessionIdKey).delete();
        sysPermService.removeUserSysPermCache(tokenData.getSessionId());
        sysDataPermService.removeDataPermCache(tokenData.getSessionId());
        cacheHelper.removeAllSessionCache(tokenData.getSessionId());
        return ResponseResult.success();
    }

    /**
     * 在登录之后，通过token再次获取登录信息。
     * 用于在当前浏览器登录系统后，在新tab页中可以免密登录。
     *
     * @return 应答结果对象，其中包括JWT的Token数据，以及菜单列表。
     */
    @GetMapping("/getLoginInfo")
    public ResponseResult<JSONObject> getLoginInfo() {
        TokenData tokenData = TokenData.takeFromRequest();
        // 这里解释一下为什么没有缓存menuList和permCodeList。
        // 1. 该操作和权限验证不同，属于低频操作。
        // 2. 第一次登录和再次获取登录信息之间，如果修改了用户的权限，那么本次获取的是最新权限。
        // 3. 上一个问题无法避免，因为即便缓存也是有过期时间的，过期之后还是要从数据库获取的。
        JSONObject jsonData = new JSONObject();
        jsonData.put("showName", tokenData.getShowName());
        jsonData.put("isAdmin", tokenData.getIsAdmin());
        if (StrUtil.isNotBlank(tokenData.getHeadImageUrl())) {
            jsonData.put("headImageUrl", tokenData.getHeadImageUrl());
        }
        Collection<SysMenu> menuList;
        Collection<String> permCodeList;
        if (tokenData.getIsAdmin()) {
            menuList = sysMenuService.getAllMenuList();
            permCodeList = sysPermCodeService.getAllPermCodeList();
        } else {
            menuList = sysMenuService.getMenuListByUserId(tokenData.getUserId());
            permCodeList = sysPermCodeService.getPermCodeListByUserId(tokenData.getUserId());
        }
        jsonData.put("menuList", menuList);
        jsonData.put("permCodeList", permCodeList);
        return ResponseResult.success(jsonData);
    }

    /**
     * 用户修改自己的密码。
     *
     * @param oldPass 原有密码。
     * @param newPass 新密码。
     * @return 应答结果对象。
     */
    @PostMapping("/changePassword")
    public ResponseResult<Void> changePassword(
            @MyRequestBody String oldPass, @MyRequestBody String newPass) throws Exception {
        if (MyCommonUtil.existBlankArgument(newPass, oldPass)) {
            return ResponseResult.error(ErrorCodeEnum.ARGUMENT_NULL_EXIST);
        }
        TokenData tokenData = TokenData.takeFromRequest();
        SysUser user = sysUserService.getById(tokenData.getUserId());
        oldPass = URLDecoder.decode(oldPass, StandardCharsets.UTF_8.name());
        // NOTE: 第一次使用时，请务必阅读ApplicationConstant.PRIVATE_KEY的代码注释。
        // 执行RsaUtil工具类中的main函数，可以生成新的公钥和私钥。
        oldPass = RsaUtil.decrypt(oldPass, ApplicationConstant.PRIVATE_KEY);
        if (user == null || !passwordEncoder.matches(oldPass, user.getPassword())) {
            return ResponseResult.error(ErrorCodeEnum.INVALID_USERNAME_PASSWORD);
        }
        newPass = URLDecoder.decode(newPass, StandardCharsets.UTF_8.name());
        newPass = RsaUtil.decrypt(newPass, ApplicationConstant.PRIVATE_KEY);
        if (!sysUserService.changePassword(tokenData.getUserId(), newPass)) {
            return ResponseResult.error(ErrorCodeEnum.DATA_NOT_EXIST);
        }
        return ResponseResult.success();
    }
    
    /**
     * 上传并修改用户头像。
     *
     * @param uploadFile 上传的头像文件。
     */
    @PostMapping("/changeHeadImage")
    public void changeHeadImage(
            @RequestParam("uploadFile") MultipartFile uploadFile) throws Exception {
        String fieldName = "headImageUrl";
        UploadStoreInfo storeInfo = MyModelUtil.getUploadStoreInfo(SysUser.class, fieldName);
        BaseUpDownloader upDownloader = upDownloaderFactory.get(storeInfo.getStoreType());
        UploadResponseInfo responseInfo = upDownloader.doUpload(null,
                appConfig.getUploadFileBaseDir(), SysUser.class.getSimpleName(), fieldName, true, uploadFile);
        if (responseInfo.getUploadFailed()) {
            ResponseResult.output(HttpServletResponse.SC_FORBIDDEN,
                    ResponseResult.error(ErrorCodeEnum.UPLOAD_FAILED, responseInfo.getErrorMessage()));
            return;
        }
        responseInfo.setDownloadUri("/admin/upms/login/downloadHeadImage");
        String newHeadImage = JSONArray.toJSONString(CollUtil.newArrayList(responseInfo));
        if (!sysUserService.changeHeadImage(TokenData.takeFromRequest().getUserId(), newHeadImage)) {
            ResponseResult.output(HttpServletResponse.SC_FORBIDDEN,
                    ResponseResult.error(ErrorCodeEnum.DATA_NOT_EXIST));
            return;
        }
        ResponseResult.output(ResponseResult.success(responseInfo));
    }

    /**
     * 下载用户头像。
     *
     * @param filename 文件名。如果没有提供该参数，就从当前记录的指定字段中读取。
     * @param response Http 应答对象。
     */
    @GetMapping("/downloadHeadImage")
    public void downloadHeadImage(String filename, HttpServletResponse response) {
        try {
            SysUser user = sysUserService.getById(TokenData.takeFromRequest().getUserId());
            if (user == null) {
                ResponseResult.output(HttpServletResponse.SC_NOT_FOUND);
                return;
            }
            if (StrUtil.isBlank(user.getHeadImageUrl())) {
                ResponseResult.output(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }
            if (!BaseUpDownloader.containFile(user.getHeadImageUrl(), filename)) {
                ResponseResult.output(HttpServletResponse.SC_FORBIDDEN);
                return;
            }
            String fieldName = "headImageUrl";
            UploadStoreInfo storeInfo = MyModelUtil.getUploadStoreInfo(SysUser.class, fieldName);
            BaseUpDownloader upDownloader = upDownloaderFactory.get(storeInfo.getStoreType());
            upDownloader.doDownload(appConfig.getUploadFileBaseDir(),
                    SysUser.class.getSimpleName(), fieldName, filename, true, response);
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            log.error(e.getMessage(), e);
        }
    }

    private JSONObject buildLoginData(SysUser user) {
        int deviceType = MyCommonUtil.getDeviceType();
        boolean isAdmin = user.getUserType() == SysUserType.TYPE_ADMIN;
        String headImageUrl = user.getHeadImageUrl();
        Map<String, Object> claims = new HashMap<>(3);
        String sessionId = user.getLoginName() + "_" + deviceType + "_" + MyCommonUtil.generateUuid();
        claims.put("sessionId", sessionId);
        String token = JwtUtil.generateToken(claims, appConfig.getExpiration(), appConfig.getTokenSigningKey());
        JSONObject jsonData = new JSONObject();
        jsonData.put(TokenData.REQUEST_ATTRIBUTE_NAME, token);
        jsonData.put("showName", user.getShowName());
        jsonData.put("isAdmin", isAdmin);
        if (StrUtil.isNotBlank(headImageUrl)) {
            jsonData.put("headImageUrl", headImageUrl);
        }
        TokenData tokenData = new TokenData();
        tokenData.setSessionId(sessionId);
        tokenData.setUserId(user.getUserId());
        tokenData.setDeptId(user.getDeptId());
        tokenData.setLoginName(user.getLoginName());
        tokenData.setShowName(user.getShowName());
        tokenData.setIsAdmin(isAdmin);
        tokenData.setLoginIp(IpUtil.getRemoteIpAddress(ContextUtil.getHttpRequest()));
        tokenData.setLoginTime(new Date());
        tokenData.setDeviceType(deviceType);
        if (StrUtil.isNotBlank(headImageUrl)) {
            tokenData.setHeadImageUrl(headImageUrl);
        }
        List<SysUserPost> userPostList = sysPostService.getSysUserPostListByUserId(user.getUserId());
        if (CollectionUtils.isNotEmpty(userPostList)) {
            Set<Long> deptPostIdSet = userPostList.stream().map(SysUserPost::getDeptPostId).collect(Collectors.toSet());
            tokenData.setDeptPostIds(StringUtils.join(deptPostIdSet, ","));
            Set<Long> postIdSet = userPostList.stream().map(SysUserPost::getPostId).collect(Collectors.toSet());
            tokenData.setPostIds(StringUtils.join(postIdSet, ","));
        }
        List<SysUserRole> userRoleList = sysRoleService.getSysUserRoleListByUserId(user.getUserId());
        if (CollectionUtils.isNotEmpty(userRoleList)) {
            Set<Long> userRoleIdSet = userRoleList.stream().map(SysUserRole::getRoleId).collect(Collectors.toSet());
            tokenData.setRoleIds(StringUtils.join(userRoleIdSet, ","));
        }
        String sessionIdKey = RedisKeyUtil.makeSessionIdKey(sessionId);
        String sessionData = JSON.toJSONString(tokenData, SerializerFeature.WriteNonStringValueAsString);
        RBucket<String> bucket = redissonClient.getBucket(sessionIdKey);
        bucket.set(sessionData);
        bucket.expire(appConfig.getSessionExpiredSeconds(), TimeUnit.SECONDS);
        // 这里手动将TokenData存入request，便于OperationLogAspect统一处理操作日志。
        TokenData.addToRequest(tokenData);
        Collection<SysMenu> menuList;
        Collection<String> permCodeList;
        if (isAdmin) {
            menuList = sysMenuService.getAllMenuList();
            permCodeList = sysPermCodeService.getAllPermCodeList();
        } else {
            menuList = sysMenuService.getMenuListByUserId(user.getUserId());
            permCodeList = sysPermCodeService.getPermCodeListByUserId(user.getUserId());
        }
        List<SysMenu> onlineMenuList;
        if (isAdmin) {
            onlineMenuList = sysMenuService.getAllOnlineMenuList(SysMenuType.TYPE_BUTTON);
        } else {
            onlineMenuList = sysMenuService.getOnlineMenuListByUserId(user.getUserId(), SysMenuType.TYPE_BUTTON);
        }
        OnlinePermData onlinePermData = this.getOnlinePermCodeSet(onlineMenuList);
        if (CollectionUtils.isNotEmpty(onlinePermData.permCodeSet)) {
            permCodeList.addAll(onlinePermData.permCodeSet);
        }
        jsonData.put("menuList", menuList);
        jsonData.put("permCodeList", permCodeList);
        if (user.getUserType() != SysUserType.TYPE_ADMIN) {
            // 缓存用户的权限资源
            sysPermService.putUserSysPermCache(sessionId, user.getUserId());
            sysPermService.putOnlinePermToCache(sessionId, onlinePermData.permUrlSet);
            sysDataPermService.putDataPermCache(sessionId, user.getUserId(), user.getDeptId());
        }
        return jsonData;
    }

    private OnlinePermData getOnlinePermCodeSet(List<SysMenu> onlineMenuList) {
        OnlinePermData permData = new OnlinePermData();
        if (CollectionUtils.isEmpty(onlineMenuList)) {
            return permData;
        }
        Set<Long> viewFormIdSet = new HashSet<>();
        Set<Long> editFormIdSet = new HashSet<>();
        for (SysMenu menu : onlineMenuList) {
            if (menu.getOnlineMenuPermType() == SysOnlineMenuPermType.TYPE_VIEW) {
                viewFormIdSet.add(menu.getOnlineFormId());
            } else if (menu.getOnlineMenuPermType() == SysOnlineMenuPermType.TYPE_EDIT) {
                editFormIdSet.add(menu.getOnlineFormId());
            }
        }
        if (CollectionUtils.isNotEmpty(viewFormIdSet)) {
            List<OnlineDatasource> viewDatasourceList =
                    onlineDatasourceService.getOnlineDatasourceListByFormIds(viewFormIdSet);
            for (OnlineDatasource datasource : viewDatasourceList) {
                permData.permCodeSet.add(OnlineUtil.makeViewPermCode(datasource.getVariableName()));
                for (String permUrl : onlineProperties.getViewUrlList()) {
                    permData.permUrlSet.add(permUrl + datasource.getVariableName());
                }
            }
        }
        if (CollectionUtils.isNotEmpty(editFormIdSet)) {
            List<OnlineDatasource> editableDatasourceList =
                    onlineDatasourceService.getOnlineDatasourceListByFormIds(editFormIdSet);
            for (OnlineDatasource datasource : editableDatasourceList) {
                permData.permCodeSet.add(OnlineUtil.makeEditPermCode(datasource.getVariableName()));
                for (String permUrl : onlineProperties.getEditUrlList()) {
                    permData.permUrlSet.add(permUrl + datasource.getVariableName());
                }
            }
        }
        // 这个非常非常重要，不能删除。因为在线票单的url前缀是可以配置的，那么表单字典接口的url也是动态。
        // 所以就不能把这个字典列表接口放到数据库的白名单表中。
        permData.permUrlSet.add(onlineProperties.getUrlPrefix() + "/onlineOperation/listDict");
        permData.permUrlSet.add(onlineProperties.getUrlPrefix() + "/onlineForm/render");
        permData.permUrlSet.add(onlineProperties.getUrlPrefix() + "/onlineForm/view");
        return permData;
    }

    static class OnlinePermData {
        public final Set<String> permCodeSet = new HashSet<>();
        public final Set<String> permUrlSet = new HashSet<>();
    }
}
