package com.orange.demo.app.controller;

import com.github.pagehelper.page.PageMethod;
import com.orange.demo.app.model.*;
import com.orange.demo.app.service.*;
import com.orange.demo.common.core.object.*;
import com.orange.demo.common.core.util.*;
import com.orange.demo.common.core.constant.ErrorCodeEnum;
import com.orange.demo.common.core.annotation.MyRequestBody;
import com.orange.demo.common.core.validator.UpdateGroup;
import lombok.extern.slf4j.Slf4j;
import com.alibaba.fastjson.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import javax.validation.groups.Default;

/**
 * 学生行为流水操作控制器类。
 *
 * @author Jerry
 * @date 2020-09-27
 */
@Slf4j
@RestController
@RequestMapping("/admin/app/studentActionTrans")
public class StudentActionTransController {

    @Autowired
    private StudentActionTransService studentActionTransService;

    /**
     * 新增学生行为流水数据。
     *
     * @param studentActionTrans 新增对象。
     * @return 应答结果对象，包含新增对象主键Id。
     */
    @PostMapping("/add")
    public ResponseResult<JSONObject> add(@MyRequestBody StudentActionTrans studentActionTrans) {
        String errorMessage = MyCommonUtil.getModelValidationError(studentActionTrans);
        if (errorMessage != null) {
            return ResponseResult.error(ErrorCodeEnum.DATA_VALIDATAED_FAILED, errorMessage);
        }
        // 验证关联Id的数据合法性
        CallResult callResult = studentActionTransService.verifyRelatedData(studentActionTrans, null);
        if (!callResult.isSuccess()) {
            errorMessage = callResult.getErrorMessage();
            return ResponseResult.error(ErrorCodeEnum.DATA_VALIDATAED_FAILED, errorMessage);
        }
        studentActionTrans = studentActionTransService.saveNew(studentActionTrans);
        JSONObject responseData = new JSONObject();
        responseData.put("transId", studentActionTrans.getTransId());
        return ResponseResult.success(responseData);
    }

    /**
     * 更新学生行为流水数据。
     *
     * @param studentActionTrans 更新对象。
     * @return 应答结果对象。
     */
    @PostMapping("/update")
    public ResponseResult<Void> update(@MyRequestBody StudentActionTrans studentActionTrans) {
        String errorMessage = MyCommonUtil.getModelValidationError(studentActionTrans, Default.class, UpdateGroup.class);
        if (errorMessage != null) {
            return ResponseResult.error(ErrorCodeEnum.DATA_VALIDATAED_FAILED, errorMessage);
        }
        // 验证关联Id的数据合法性
        StudentActionTrans originalStudentActionTrans = studentActionTransService.getById(studentActionTrans.getTransId());
        if (originalStudentActionTrans == null) {
            //NOTE: 修改下面方括号中的话述
            errorMessage = "数据验证失败，当前 [数据] 并不存在，请刷新后重试！";
            return ResponseResult.error(ErrorCodeEnum.DATA_NOT_EXIST, errorMessage);
        }
        // 验证关联Id的数据合法性
        CallResult callResult = studentActionTransService.verifyRelatedData(studentActionTrans, originalStudentActionTrans);
        if (!callResult.isSuccess()) {
            errorMessage = callResult.getErrorMessage();
            return ResponseResult.error(ErrorCodeEnum.DATA_VALIDATAED_FAILED, errorMessage);
        }
        if (!studentActionTransService.update(studentActionTrans, originalStudentActionTrans)) {
            return ResponseResult.error(ErrorCodeEnum.DATA_NOT_EXIST);
        }
        return ResponseResult.success();
    }

    /**
     * 删除学生行为流水数据。
     *
     * @param transId 删除对象主键Id。
     * @return 应答结果对象。
     */
    @PostMapping("/delete")
    public ResponseResult<Void> delete(@MyRequestBody Long transId) {
        String errorMessage;
        if (MyCommonUtil.existBlankArgument(transId)) {
            return ResponseResult.error(ErrorCodeEnum.ARGUMENT_NULL_EXIST);
        }
        // 验证关联Id的数据合法性
        StudentActionTrans originalStudentActionTrans = studentActionTransService.getById(transId);
        if (originalStudentActionTrans == null) {
            // NOTE: 修改下面方括号中的话述
            errorMessage = "数据验证失败，当前 [对象] 并不存在，请刷新后重试！";
            return ResponseResult.error(ErrorCodeEnum.DATA_NOT_EXIST, errorMessage);
        }
        if (!studentActionTransService.remove(transId)) {
            errorMessage = "数据操作失败，删除的对象不存在，请刷新后重试！";
            return ResponseResult.error(ErrorCodeEnum.DATA_NOT_EXIST, errorMessage);
        }
        return ResponseResult.success();
    }

    /**
     * 列出符合过滤条件的学生行为流水列表。
     *
     * @param studentActionTransFilter 过滤对象。
     * @param orderParam 排序参数。
     * @param pageParam 分页参数。
     * @return 应答结果对象，包含查询结果集。
     */
    @PostMapping("/list")
    public ResponseResult<JSONObject> list(
            @MyRequestBody StudentActionTrans studentActionTransFilter,
            @MyRequestBody MyOrderParam orderParam,
            @MyRequestBody MyPageParam pageParam) {
        if (pageParam != null) {
            PageMethod.startPage(pageParam.getPageNum(), pageParam.getPageSize());
        }
        String orderBy = MyOrderParam.buildOrderBy(orderParam, StudentActionTrans.class);
        List<StudentActionTrans> resultList = studentActionTransService.getStudentActionTransListWithRelation(studentActionTransFilter, orderBy);
        return ResponseResult.success(MyPageUtil.makeResponseData(resultList));
    }

    /**
     * 查看指定学生行为流水对象详情。
     *
     * @param transId 指定对象主键Id。
     * @return 应答结果对象，包含对象详情。
     */
    @GetMapping("/view")
    public ResponseResult<StudentActionTrans> view(@RequestParam Long transId) {
        if (MyCommonUtil.existBlankArgument(transId)) {
            return ResponseResult.error(ErrorCodeEnum.ARGUMENT_NULL_EXIST);
        }
        StudentActionTrans studentActionTrans = studentActionTransService.getByIdWithRelation(transId, MyRelationParam.full());
        if (studentActionTrans == null) {
            return ResponseResult.error(ErrorCodeEnum.DATA_NOT_EXIST);
        }
        return ResponseResult.success(studentActionTrans);
    }
}
