package com.orange.demo.interceptor;

import com.alibaba.fastjson.JSON;
import com.orange.demo.config.ApplicationConfig;
import com.orange.demo.upms.model.SysPermWhitelist;
import com.orange.demo.upms.service.SysPermWhitelistService;
import com.orange.demo.upms.service.SysPermService;
import com.orange.demo.common.core.annotation.NoAuthInterface;
import com.orange.demo.common.core.constant.ErrorCodeEnum;
import com.orange.demo.common.core.object.ResponseResult;
import com.orange.demo.common.core.object.TokenData;
import com.orange.demo.common.core.util.ApplicationContextHolder;
import com.orange.demo.common.core.util.JwtUtil;
import com.orange.demo.common.core.cache.SessionCacheHelper;
import io.jsonwebtoken.Claims;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Set;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 登录用户Token验证、生成和权限验证的拦截器。
 *
 * @author Jerry
 * @date 2020-09-24
 */
@Slf4j
public class AuthenticationInterceptor implements HandlerInterceptor {

    private ApplicationConfig appConfig =
            ApplicationContextHolder.getBean("applicationConfig");

    private SessionCacheHelper cacheHelper =
            ApplicationContextHolder.getBean("sessionCacheHelper");

    private SysPermService sysPermService =
            ApplicationContextHolder.getBean(SysPermService.class);

    private static SysPermWhitelistService sysPermWhitelistService =
            ApplicationContextHolder.getBean(SysPermWhitelistService.class);

    private static Set<String> whitelistPermSet;

    static {
        List<SysPermWhitelist> sysPermWhitelistList = sysPermWhitelistService.getAllList();
        whitelistPermSet = sysPermWhitelistList.stream()
                .map(SysPermWhitelist::getPermUrl).collect(Collectors.toSet());
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        String url = request.getRequestURI();
        // 如果接口方法标记NoAuthInterface注解，可以直接跳过Token鉴权验证，这里主要为了测试接口方便
        if (handler instanceof HandlerMethod) {
            HandlerMethod hm = (HandlerMethod) handler;
            if (hm.getBeanType().getAnnotation(NoAuthInterface.class) != null
                    || hm.getMethodAnnotation(NoAuthInterface.class) != null) {
                return true;
            }
        }
        String token = request.getHeader(appConfig.getTokenHeaderKey());
        if (StringUtils.isBlank(token)) {
            token = request.getParameter(appConfig.getTokenHeaderKey());
        }
        Claims c = JwtUtil.parseToken(token, appConfig.getTokenSigningKey());
        if (JwtUtil.isNullOrExpired(c)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            this.outputResponseMessage(response,
                    ResponseResult.error(ErrorCodeEnum.UNAUTHORIZED_LOGIN, "用户会话已过期或尚未登录，请重新登录！"));
            return false;
        }
        String sessionId = (String) c.get("sessionId");
        TokenData tokenData = cacheHelper.getTokenData(sessionId);
        if (tokenData == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            this.outputResponseMessage(response,
                    ResponseResult.error(ErrorCodeEnum.UNAUTHORIZED_LOGIN, "用户会话已失效，请重新登录！"));
            return false;
        }
        TokenData.addToRequest(tokenData);
        // 如果url在权限资源白名单中，则不需要进行鉴权操作
        if (Boolean.FALSE.equals(tokenData.getIsAdmin()) && !whitelistPermSet.contains(url)) {
            Set<String> urlSet = sysPermService.getCacheableSysPermSetByUserId(
                    tokenData.getSessionId(), tokenData.getUserId());
            if (!urlSet.contains(url)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                this.outputResponseMessage(response,
                        ResponseResult.error(ErrorCodeEnum.NO_OPERATION_PERMISSION));
                return false;
            }
        }
        if (JwtUtil.needToRefresh(c)) {
            String refreshedToken = JwtUtil.generateToken(c, appConfig.getExpiration(), appConfig.getTokenSigningKey());
            response.addHeader(appConfig.getRefreshedTokenHeaderKey(), refreshedToken);
        }
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
                           ModelAndView modelAndView) throws Exception {
        // 这里需要空注解，否则sonar会不happy。
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
            throws Exception {
        // 这里需要空注解，否则sonar会不happy。
    }

    private void outputResponseMessage(HttpServletResponse response, ResponseResult<Object> respObj) {
        PrintWriter out;
        try {
            out = response.getWriter();
        } catch (IOException e) {
            log.error("Failed to call OutputResponseMessage.", e);
            return;
        }
        response.setContentType("application/json; charset=utf-8");
        out.print(JSON.toJSONString(respObj));
        out.flush();
        out.close();
    }
}
