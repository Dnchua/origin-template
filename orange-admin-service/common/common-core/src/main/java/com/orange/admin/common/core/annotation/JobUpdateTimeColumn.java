package com.orange.admin.common.core.annotation;

import java.lang.annotation.*;

/**
 * 主要用于标记更新字段。
 *
 * @author Stephen.Liu
 * @date 2020-05-24
 */
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface JobUpdateTimeColumn {

}
