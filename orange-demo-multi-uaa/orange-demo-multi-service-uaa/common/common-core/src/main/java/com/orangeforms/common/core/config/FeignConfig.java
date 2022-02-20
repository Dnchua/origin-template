package com.orangeforms.common.core.config;

import com.orangeforms.common.core.constant.ApplicationConstant;
import com.orangeforms.common.core.object.TokenData;
import com.orangeforms.common.core.util.ContextUtil;
import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.SneakyThrows;
import org.apache.commons.lang3.StringUtils;
import org.springframework.context.annotation.Configuration;

/**
 * FeignClient的配置对象。
 *
 * @author Jerry
 * @date 2020-08-08
 */
@Configuration
public class FeignConfig implements RequestInterceptor {

    @SneakyThrows
    @Override
    public void apply(RequestTemplate requestTemplate) {
        // 对于非servlet请求发起的远程调用，由于无法获取到标识用户身份的TokenData，因此需要略过下面的HEADER注入。
        // 如：由消息队列consumer发起的远程调用请求。
        if (!ContextUtil.hasRequestContext()) {
            return;
        }
        String tokenData = ContextUtil.getHttpRequest().getHeader(TokenData.REQUEST_ATTRIBUTE_NAME);
        if (StringUtils.isNotBlank(tokenData)) {
            requestTemplate.header(TokenData.REQUEST_ATTRIBUTE_NAME, tokenData);
        }
        String traceId = ContextUtil.getHttpRequest().getHeader(ApplicationConstant.HTTP_HEADER_TRACE_ID);
        if (StringUtils.isBlank(traceId)) {
            traceId = (String) ContextUtil.getHttpRequest().getAttribute(ApplicationConstant.HTTP_HEADER_TRACE_ID);
        }
        if (StringUtils.isNotBlank(traceId)) {
            requestTemplate.header(ApplicationConstant.HTTP_HEADER_TRACE_ID, traceId);
        }
    }
}
