package com.orange.demo.common.core.util;

import cn.hutool.crypto.digest.DigestUtil;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import java.util.Collection;
import java.util.Iterator;
import java.util.Set;
import java.util.UUID;

/**
 * 脚手架中常用的基本工具方法集合，一般而言工程内部使用的方法。
 *
 * @author Jerry
 * @date 2020-09-25
 */
public class MyCommonUtil {

    private static Validator validator;

    static {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    /**
     * 创建uuid。
     *
     * @return 返回uuid。
     */
    public static String generateUuid() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    /**
     * 对用户密码进行加盐后加密。
     *
     * @param password     明文密码。
     * @param passwordSalt 盐值。
     * @return 加密后的密码。
     */
    public static String encrptedPassword(String password, String passwordSalt) {
        return DigestUtil.md5Hex(password + passwordSalt);
    }

    /**
     * 这个方法一般用于Controller对于入口参数的基本验证。
     * 对于字符串，如果为空字符串，也将视为Blank，同时返回true。
     *
     * @param objs 一组参数。
     * @return 返回是否存在null或空字符串的参数。
     */
    public static boolean existBlankArgument(Object...objs) {
        for (Object obj : objs) {
            if (MyCommonUtil.isBlankOrNull(obj)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 结果和 existBlankArgument 相反。
     *
     * @param objs 一组参数。
     * @return 返回是否存在null或空字符串的参数。
     */
    public static boolean existNotBlankArgument(Object...objs) {
        for (Object obj : objs) {
            if (!MyCommonUtil.isBlankOrNull(obj)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 验证参数是否为空。
     *
     * @param obj 待判断的参数。
     * @return 空或者null返回true，否则false。
     */
    public static boolean isBlankOrNull(Object obj) {
        if (obj instanceof Collection) {
            return CollectionUtils.isEmpty((Collection<?>) obj);
        }
        return obj == null || (obj instanceof CharSequence && StringUtils.isBlank((CharSequence) obj));
    }

    /**
     * 验证参数是否为非空。
     *
     * @param obj 待判断的参数。
     * @return 空或者null返回false，否则true。
     */
    public static boolean isNotBlankOrNull(Object obj) {
        return !isBlankOrNull(obj);
    }

    /**
     * 判断模型对象是否通过校验，没有通过返回具体的校验错误信息。
     *
     * @param model  带校验的model。
     * @param groups Validate绑定的校验组。
     * @return 没有错误返回null，否则返回具体的错误信息。
     */
    public static <T> String getModelValidationError(T model, Class<?>...groups) {
        Set<ConstraintViolation<T>> constraintViolations = validator.validate(model, groups);
        if (!constraintViolations.isEmpty()) {
            Iterator<ConstraintViolation<T>> it = constraintViolations.iterator();
            ConstraintViolation<T> constraint = it.next();
            return constraint.getMessage();
        }
        return null;
    }

    /**
     * 拼接参数中的字符串列表，用指定分隔符进行分割，同时每个字符串对象用单引号括起来。
     *
     * @param dataList  字符串集合。
     * @param separator 分隔符。
     * @return 拼接后的字符串。
     */
    public static String joinString(Collection<String> dataList, final char separator) {
        int index = 0;
        StringBuilder sb = new StringBuilder(128);
        for (String data : dataList) {
            sb.append("'").append(data).append("'");
            if (index++ != dataList.size() - 1) {
                sb.append(separator);
            }
        }
        return sb.toString();
    }

    /**
     * 私有构造函数，明确标识该常量类的作用。
     */
    private MyCommonUtil() {
    }
}
