package com.orangeforms.upmsservice.controller;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.JSONArray;
import com.anji.captcha.model.common.ResponseModel;
import com.anji.captcha.model.vo.CaptchaVO;
import com.anji.captcha.service.CaptchaService;
import com.github.xiaoymin.knife4j.annotations.ApiSupport;
import io.swagger.annotations.Api;
import lombok.extern.slf4j.Slf4j;
import com.orangeforms.common.core.annotation.MyRequestBody;
import com.orangeforms.common.core.constant.ErrorCodeEnum;
import com.orangeforms.common.core.constant.ApplicationConstant;
import com.orangeforms.common.core.object.*;
import com.orangeforms.common.core.util.*;
import com.orangeforms.common.core.upload.*;
import com.orangeforms.common.redis.cache.SessionCacheHelper;
import com.orangeforms.common.log.annotation.OperationLog;
import com.orangeforms.common.log.model.constant.SysOperationLogType;
import com.orangeforms.upmsapi.constant.SysUserStatus;
import com.orangeforms.upmsapi.constant.SysUserType;
import com.orangeforms.upmsservice.config.UaaConfig;
import com.orangeforms.upmsservice.config.ApplicationConfig;
import com.orangeforms.upmsservice.model.*;
import com.orangeforms.upmsservice.service.*;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 登录接口控制器类。
 *
 * @author Jerry
 * @date 2020-08-08
 */
@ApiSupport(order = 1)
@Api(tags = "登录接口")
@Slf4j
@RestController
@RequestMapping("/login")
public class LoginController {

    @Autowired
    private SysUserService sysUserService;
    @Autowired
    private SysPermCodeService sysPermCodeService;
    @Autowired
    private SysPermService sysPermService;
    @Autowired
    private SysMenuService sysMenuService;
    @Autowired
    private SysRoleService sysRoleService;
    @Autowired
    private SysDataPermService sysDataPermService;
    @Autowired
    private SysPermWhitelistService sysPermWhitelistService;
    @Autowired
    private RedissonClient redissonClient;
    @Autowired
    private SessionCacheHelper cacheHelper;
    @Autowired
    private RestTemplate restTemplate;
    @Autowired
    private UaaConfig uaaConfig;
    @Autowired
    private ApplicationConfig appConfig;
    @Autowired
    private CaptchaService captchaService;
    @Autowired
    private UpDownloaderFactory upDownloaderFactory;

    /**
     * 获取UAA登录验证URL。
     * @return UAA登录验证URL。
     */
    @GetMapping("/getUaaLoginUrl")
    public ResponseResult<String> getUaaLoginUrl() {
        String uaaLoginUrl = normalizeUaaBaseUrl() + "oauth/authorize?response_type=code&client_id="
                + uaaConfig.getClientId() + "&redirect_uri=" + uaaConfig.getLoginUaaRedirectUri();
        return ResponseResult.success(uaaLoginUrl);
    }

    /**
     * 获取UAA登录验证URL。
     * @return UAA登录验证URL。
     */
    @GetMapping("/getUaaLogoutUrl")
    public ResponseResult<String> getUaaLogoutUrl() {
        TokenData tokenData = TokenData.takeFromRequest();
        String uaaLogoutUrl = normalizeUaaBaseUrl() + "oauth/remove/token?redirect_uri="
                + uaaConfig.getLogoutUaaRedirectUri() + "&access_token=" + tokenData.getUaaAccessToken();
        return ResponseResult.success(uaaLogoutUrl);
    }

    /**
     * UAA登录接口。
     *
     * @param authCode uaa授权码。
     * @return 应答结果对象，其中包括JWT的Token数据，以及菜单列表和权限字集合等数据。
     */
    @OperationLog(type = SysOperationLogType.LOGIN, saveResponse = false)
    @PostMapping("/doLoginByUaa")
    public ResponseResult<JSONObject> doLoginByUaa(@MyRequestBody String authCode) throws Exception {
        if (MyCommonUtil.existBlankArgument(authCode)) {
            return ResponseResult.error(ErrorCodeEnum.ARGUMENT_NULL_EXIST);
        }
        ResponseEntity<String> responseEntity = this.getAccessTokenByAuthCode(authCode);
        if (responseEntity.getStatusCode() != HttpStatus.OK) {
            return ResponseResult.error(ErrorCodeEnum.INVALID_ACCESS_TOKEN);
        }
        JSONObject accessTokenData = JSONObject.parseObject(responseEntity.getBody());
        String accessToken = (String) accessTokenData.get("access_token");
        String username = (String) accessTokenData.get("username");
        SysUser user = sysUserService.getSysUserByLoginName(username);
        if (user == null) {
            return ResponseResult.error(ErrorCodeEnum.INVALID_USERNAME_PASSWORD);
        }
        String errorMessage;
        if (user.getUserStatus() == SysUserStatus.STATUS_LOCKED) {
            errorMessage = "登录失败，用户账号被锁定！";
            return ResponseResult.error(ErrorCodeEnum.INVALID_USER_STATUS, errorMessage);
        }
        String patternKey = RedisKeyUtil.getSessionIdPrefix(user.getLoginName(), MyCommonUtil.getDeviceType()) + "*";
        redissonClient.getKeys().deleteByPatternAsync(patternKey);
        JSONObject jsonData = this.buildLoginData(user, accessToken);
        return ResponseResult.success(jsonData);
    }

    /**
     * 本地登录接口，仍然使用OAuth2的password模式进行用户身份验证。
     *
     * @param loginName           登录名。
     * @param password            密码。
     * @param captchaVerification 验证码。
     * @return 应答结果对象，其中包括JWT的Token数据，以及菜单列表。
     */
    @OperationLog(type = SysOperationLogType.LOGIN, saveResponse = false)
    @PostMapping("/doLogin")
    public ResponseResult<JSONObject> doLogin(
            @MyRequestBody String loginName,
            @MyRequestBody String password,
            @MyRequestBody String captchaVerification) throws Exception {
        if (MyCommonUtil.existBlankArgument(loginName, password)) {
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
        ResponseEntity<String> responseEntity = this.getAccessTokenByUsernameAndPassword(loginName, password);
        if (responseEntity.getStatusCode() != HttpStatus.OK) {
            return ResponseResult.error(ErrorCodeEnum.INVALID_USERNAME_PASSWORD);
        }
        JSONObject accessTokenData = JSONObject.parseObject(responseEntity.getBody());
        String accessToken = (String) accessTokenData.get("access_token");
        SysUser user = sysUserService.getSysUserByLoginName(loginName);
        if (user == null) {
            return ResponseResult.error(ErrorCodeEnum.INVALID_USERNAME_PASSWORD);
        }
        if (user.getUserStatus() == SysUserStatus.STATUS_LOCKED) {
            errorMessage = "登录失败，用户账号被锁定！";
            return ResponseResult.error(ErrorCodeEnum.INVALID_USER_STATUS, errorMessage);
        }
        String patternKey = RedisKeyUtil.getSessionIdPrefix(user.getLoginName(), MyCommonUtil.getDeviceType()) + "*";
        redissonClient.getKeys().deleteByPatternAsync(patternKey);
        JSONObject jsonData = this.buildLoginData(user, accessToken);
        return ResponseResult.success(jsonData);
    }

    /**
     * 登出操作。同时将Session相关的信息从缓存中删除。
     *
     * @return 应答结果对象。
     */
    @OperationLog(type = SysOperationLogType.LOGOUT)
    @PostMapping("/doLogout")
    public ResponseResult<Void> doLogout() {
        TokenData tokenData = TokenData.takeFromRequest();
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
     * 通过UAA修改用户密码。
     *
     * @param oldPass 原有密码。
     * @param newPass 新密码。
     * @return 应答结果对象。
     */
    @PostMapping("/changePasswordByUaa")
    public ResponseResult<Void> changePasswordByUaa(
            @MyRequestBody String oldPass, @MyRequestBody String newPass) throws Exception {
        if (MyCommonUtil.existBlankArgument(newPass, oldPass)) {
            return ResponseResult.error(ErrorCodeEnum.ARGUMENT_NULL_EXIST);
        }
        TokenData tokenData = TokenData.takeFromRequest();
        SysUser user = sysUserService.getById(tokenData.getUserId());
        if (user == null) {
            return ResponseResult.error(ErrorCodeEnum.INVALID_USERNAME_PASSWORD);
        }
        oldPass = URLDecoder.decode(oldPass, StandardCharsets.UTF_8.name());
        // NOTE: 第一次使用时，请务必阅读ApplicationConstant.PRIVATE_KEY的代码注释。
        // 执行RsaUtil工具类中的main函数，可以生成新的公钥和私钥。
        oldPass = RsaUtil.decrypt(oldPass, ApplicationConstant.PRIVATE_KEY);
        newPass = URLDecoder.decode(newPass, StandardCharsets.UTF_8.name());
        newPass = RsaUtil.decrypt(newPass, ApplicationConstant.PRIVATE_KEY);
        String url = normalizeUaaBaseUrl() + "uaaauth/sysUaaUser/changePassword?"
                + "access_token=" + tokenData.getUaaAccessToken()
                + "&username=" + user.getLoginName()
                + "&oldPass=" + oldPass
                + "&newPass=" + newPass;
        ResponseEntity<ResponseResult> responseEntity = restTemplate.getForEntity(url, ResponseResult.class);
        if (responseEntity.getStatusCode() != HttpStatus.OK) {
            return ResponseResult.error(ErrorCodeEnum.INVALID_ACCESS_TOKEN);
        }
        ResponseResult<?> result = responseEntity.getBody();
        return result.isSuccess() ? ResponseResult.success() : ResponseResult.errorFrom(result);
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

    private JSONObject buildLoginData(SysUser user, String accessToken) {
        int deviceType = MyCommonUtil.getDeviceType();
        boolean isAdmin = user.getUserType() == SysUserType.TYPE_ADMIN;
        String headImageUrl = user.getHeadImageUrl();
        TokenData tokenData = new TokenData();
        String sessionId = user.getLoginName() + "_" + deviceType + "_" + MyCommonUtil.generateUuid();
        tokenData.setUserId(user.getUserId());
        tokenData.setDeptId(user.getDeptId());
        tokenData.setIsAdmin(isAdmin);
        tokenData.setLoginName(user.getLoginName());
        tokenData.setShowName(user.getShowName());
        tokenData.setSessionId(sessionId);
        tokenData.setLoginIp(IpUtil.getRemoteIpAddress(ContextUtil.getHttpRequest()));
        tokenData.setLoginTime(new Date());
        tokenData.setDeviceType(deviceType);
        if (StrUtil.isNotBlank(headImageUrl)) {
            tokenData.setHeadImageUrl(headImageUrl);
        }
        List<SysUserRole> userRoleList = sysRoleService.getSysUserRoleListByUserId(user.getUserId());
        if (CollectionUtils.isNotEmpty(userRoleList)) {
            Set<Long> userRoleIdSet = userRoleList.stream().map(SysUserRole::getRoleId).collect(Collectors.toSet());
            tokenData.setRoleIds(StringUtils.join(userRoleIdSet, ","));
        }
        if (StringUtils.isNotBlank(accessToken)) {
            tokenData.setUaaAccessToken(accessToken);
        }
        // 这里手动将TokenData存入request，便于OperationLogAspect统一处理操作日志。
        TokenData.addToRequest(tokenData);
        JSONObject jsonData = new JSONObject();
        jsonData.put(TokenData.REQUEST_ATTRIBUTE_NAME, tokenData);
        jsonData.put("showName", user.getShowName());
        jsonData.put("isAdmin", isAdmin);
        if (StrUtil.isNotBlank(headImageUrl)) {
            jsonData.put("headImageUrl", headImageUrl);
        }
        Collection<SysMenu> menuList;
        Collection<String> permCodeList;
        if (isAdmin) {
            menuList = sysMenuService.getAllMenuList();
            permCodeList = sysPermCodeService.getAllPermCodeList();
        } else {
            menuList = sysMenuService.getMenuListByUserId(tokenData.getUserId());
            permCodeList = sysPermCodeService.getPermCodeListByUserId(user.getUserId());
            // 将白名单url列表合并到当前用户的权限资源列表中，便于网关一并处理。
            Collection<String> permList = sysPermService.getPermListByUserId(user.getUserId());
            permList.addAll(sysPermWhitelistService.getWhitelistPermList());
            jsonData.put("permSet", permList);
        }
        jsonData.put("menuList", menuList);
        jsonData.put("permCodeList", permCodeList);
        if (user.getUserType() != SysUserType.TYPE_ADMIN) {
            sysDataPermService.putDataPermCache(sessionId, user.getUserId(), user.getDeptId());
        }
        return jsonData;
    }

    private ResponseEntity<String> getAccessTokenByUsernameAndPassword(
            String username, String password) throws UnsupportedEncodingException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        byte[] authorization = (uaaConfig.getClientId() + ":"
                + uaaConfig.getClientSecret()).getBytes(StandardCharsets.UTF_8);
        String base64Auth = Base64.encodeBase64String(authorization);
        headers.add("Authorization", "Basic " + base64Auth);
        MultiValueMap<String, String> param = new LinkedMultiValueMap<>();
        param.add("username", username);
        param.add("password", password);
        param.add("grant_type", "password");
        param.add("scope", "all");
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(param, headers);
        return restTemplate.postForEntity(normalizeUaaBaseUrl() + "oauth/token", request, String.class);
    }

    private ResponseEntity<String> getAccessTokenByAuthCode(String authCode) throws UnsupportedEncodingException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        byte[] authorization = (uaaConfig.getClientId() + ":"
                + uaaConfig.getClientSecret()).getBytes(StandardCharsets.UTF_8);
        String base64Auth = Base64.encodeBase64String(authorization);
        headers.add("Authorization", "Basic " + base64Auth);
        MultiValueMap<String, String> param = new LinkedMultiValueMap<>();
        param.add("code", authCode);
        param.add("grant_type", "authorization_code");
        param.add("redirect_uri", uaaConfig.getLoginUaaRedirectUri());
        param.add("scope", "all");
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(param, headers);
        return restTemplate.postForEntity(normalizeUaaBaseUrl() + "oauth/token", request, String.class);
    }

    private String normalizeUaaBaseUrl() {
        String baseUrl = uaaConfig.getUaaBaseUri();
        String suffixChar = "/";
        if (!baseUrl.endsWith(suffixChar)) {
            baseUrl = baseUrl + suffixChar;
        }
        return baseUrl;
    }
}
