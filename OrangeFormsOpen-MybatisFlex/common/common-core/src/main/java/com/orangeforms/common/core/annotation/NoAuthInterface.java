package com.orangeforms.common.core.annotation;

import java.lang.annotation.*;

/**
 * 主要用于标记无需Token验证的接口
 *
 * @author Jerry
 * @date 2024-07-02
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface NoAuthInterface {
}
