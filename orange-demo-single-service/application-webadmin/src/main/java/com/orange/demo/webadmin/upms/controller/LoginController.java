package com.orange.demo.webadmin.upms.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.serializer.SerializerFeature;
import com.github.xiaoymin.knife4j.annotations.ApiSupport;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import lombok.extern.slf4j.Slf4j;
import com.orange.demo.webadmin.config.ApplicationConfig;
import com.orange.demo.webadmin.upms.service.*;
import com.orange.demo.webadmin.upms.model.SysMenu;
import com.orange.demo.webadmin.upms.model.SysUser;
import com.orange.demo.webadmin.upms.model.constant.SysUserStatus;
import com.orange.demo.webadmin.upms.model.constant.SysUserType;
import com.orange.demo.common.core.annotation.NoAuthInterface;
import com.orange.demo.common.core.annotation.MyRequestBody;
import com.orange.demo.common.core.constant.ApplicationConstant;
import com.orange.demo.common.core.constant.ErrorCodeEnum;
import com.orange.demo.common.core.object.*;
import com.orange.demo.common.core.util.*;
import com.orange.demo.common.redis.cache.SessionCacheHelper;
import org.redisson.api.RBucket;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.TimeUnit;

/**
 * 登录接口控制器类。
 *
 * @author Jerry
 * @date 2020-09-24
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
    private ApplicationConfig appConfig;
    @Autowired
    private RedissonClient redissonClient;
    @Autowired
    private SessionCacheHelper cacheHelper;
    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 登录接口。
     *
     * @param loginName 登录名。
     * @param password  密码。
     * @return 应答结果对象，其中包括JWT的Token数据，以及菜单列表。
     */
    @ApiImplicitParams({
            // 这里包含密码密文，仅用于方便开发期间的接口测试，集成测试和发布阶段，需要将当前注解去掉。
            // 如果您重新生成了公钥和私钥，请替换password的缺省值。
            @ApiImplicitParam(name = "loginName", defaultValue = "admin"),
            @ApiImplicitParam(name = "password", defaultValue = "IP3ccke3GhH45iGHB5qP9p7iZw6xUyj28Ju10rnBiPKOI35sc%2BjI7%2FdsjOkHWMfUwGYGfz8ik31HC2Ruk%2Fhkd9f6RPULTHj7VpFdNdde2P9M4mQQnFBAiPM7VT9iW3RyCtPlJexQ3nAiA09OqG%2F0sIf1kcyveSrulxembARDbDo%3D")
    })
    @NoAuthInterface
    @PostMapping("/doLogin")
    public ResponseResult<JSONObject> doLogin(
            @MyRequestBody String loginName, @MyRequestBody String password) throws Exception {
        if (MyCommonUtil.existBlankArgument(loginName, password)) {
            return ResponseResult.error(ErrorCodeEnum.ARGUMENT_NULL_EXIST);
        }
        SysUser user = sysUserService.getSysUserByLoginName(loginName);
        password = URLDecoder.decode(password, StandardCharsets.UTF_8.name());
        // NOTE: 第一次使用时，请务必阅读ApplicationConstant.PRIVATE_KEY的代码注释。
        // 执行RsaUtil工具类中的main函数，可以生成新的公钥和私钥。
        password = RsaUtil.decrypt(password, ApplicationConstant.PRIVATE_KEY);
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseResult.error(ErrorCodeEnum.INVALID_USERNAME_PASSWORD);
        }
        String errorMessage;
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
        if (MyCommonUtil.existBlankArgument(oldPass, oldPass)) {
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

    private JSONObject buildLoginData(SysUser user) {
        boolean isAdmin = user.getUserType() == SysUserType.TYPE_ADMIN;
        Map<String, Object> claims = new HashMap<>(3);
        String sessionId = user.getLoginName() + "_" + MyCommonUtil.generateUuid();
        claims.put("sessionId", sessionId);
        String token = JwtUtil.generateToken(claims, appConfig.getExpiration(), appConfig.getTokenSigningKey());
        JSONObject jsonData = new JSONObject();
        jsonData.put(TokenData.REQUEST_ATTRIBUTE_NAME, token);
        jsonData.put("showName", user.getShowName());
        jsonData.put("isAdmin", isAdmin);
        TokenData tokenData = new TokenData();
        tokenData.setSessionId(sessionId);
        tokenData.setUserId(user.getUserId());
        tokenData.setLoginName(user.getLoginName());
        tokenData.setShowName(user.getShowName());
        tokenData.setIsAdmin(isAdmin);
        tokenData.setLoginIp(IpUtil.getRemoteIpAddress(ContextUtil.getHttpRequest()));
        tokenData.setLoginTime(new Date());
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
        jsonData.put("menuList", menuList);
        jsonData.put("permCodeList", permCodeList);
        if (user.getUserType() != SysUserType.TYPE_ADMIN) {
            // 缓存用户的权限资源
            sysPermService.putUserSysPermCache(sessionId, user.getUserId());
        }
        return jsonData;
    }
}
