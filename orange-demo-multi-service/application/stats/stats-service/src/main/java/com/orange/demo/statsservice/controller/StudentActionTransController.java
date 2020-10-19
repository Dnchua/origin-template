package com.orange.demo.statsservice.controller;

import com.alibaba.fastjson.JSONObject;
import com.github.pagehelper.Page;
import com.github.pagehelper.page.PageMethod;
import com.orange.demo.statsservice.model.*;
import com.orange.demo.statsservice.service.*;
import com.orange.demo.statsinterface.dto.*;
import com.orange.demo.common.core.object.*;
import com.orange.demo.common.core.util.*;
import com.orange.demo.common.core.constant.*;
import com.orange.demo.common.core.base.controller.BaseController;
import com.orange.demo.common.core.base.service.BaseService;
import com.orange.demo.common.core.annotation.MyRequestBody;
import com.orange.demo.common.core.validator.UpdateGroup;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.groups.Default;
import java.util.*;

/**
 * 学生行为流水操作控制器类。
 *
 * @author Jerry
 * @date 2020-10-19
 */
@Slf4j
@RestController
@RequestMapping("/studentActionTrans")
public class StudentActionTransController extends BaseController<StudentActionTrans, StudentActionTransDto, Long> {

    @Autowired
    private StudentActionTransService studentActionTransService;

    @Override
    protected BaseService<StudentActionTrans, StudentActionTransDto, Long> service() {
        return studentActionTransService;
    }

    /**
     * 新增学生行为流水数据。
     *
     * @param studentActionTransDto 新增对象。
     * @return 应答结果对象，包含新增对象主键Id。
     */
    @PostMapping("/add")
    public ResponseResult<JSONObject> add(@MyRequestBody("studentActionTrans") StudentActionTransDto studentActionTransDto) {
        String errorMessage = MyCommonUtil.getModelValidationError(studentActionTransDto);
        if (errorMessage != null) {
            return ResponseResult.error(ErrorCodeEnum.DATA_VALIDATAED_FAILED, errorMessage);
        }
        StudentActionTrans studentActionTrans = StudentActionTrans.INSTANCE.toModel(studentActionTransDto);
        // 验证远程服务关联Id的数据合法性
        CallResult remoteCallResult = studentActionTransService.verifyRemoteRelatedData(studentActionTrans, null);
        if (!remoteCallResult.isSuccess()) {
            errorMessage = remoteCallResult.getErrorMessage();
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
     * @param studentActionTransDto 更新对象。
     * @return 应答结果对象。
     */
    @PostMapping("/update")
    public ResponseResult<Void> update(@MyRequestBody("studentActionTrans") StudentActionTransDto studentActionTransDto) {
        String errorMessage = MyCommonUtil.getModelValidationError(studentActionTransDto, Default.class, UpdateGroup.class);
        if (errorMessage != null) {
            return ResponseResult.error(ErrorCodeEnum.DATA_VALIDATAED_FAILED, errorMessage);
        }
        StudentActionTrans studentActionTrans = StudentActionTrans.INSTANCE.toModel(studentActionTransDto);
        StudentActionTrans originalStudentActionTrans = studentActionTransService.getById(studentActionTrans.getTransId());
        if (originalStudentActionTrans == null) {
            // NOTE: 修改下面方括号中的话述
            errorMessage = "数据验证失败，当前 [数据] 并不存在，请刷新后重试！";
            return ResponseResult.error(ErrorCodeEnum.DATA_NOT_EXIST, errorMessage);
        }
        // 验证远程服务关联Id的数据合法性
        CallResult remoteCallResult = studentActionTransService.verifyRemoteRelatedData(studentActionTrans, originalStudentActionTrans);
        if (!remoteCallResult.isSuccess()) {
            errorMessage = remoteCallResult.getErrorMessage();
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
            //NOTE: 修改下面方括号中的话述
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
     * @param studentActionTransDtoFilter 过滤对象。
     * @param orderParam 排序参数。
     * @param pageParam 分页参数。
     * @return 应答结果对象，包含查询结果集。
     */
    @PostMapping("/list")
    public ResponseResult<JSONObject> list(
            @MyRequestBody("studentActionTransFilter") StudentActionTransDto studentActionTransDtoFilter,
            @MyRequestBody MyOrderParam orderParam,
            @MyRequestBody MyPageParam pageParam) {
        if (pageParam != null) {
            PageMethod.startPage(pageParam.getPageNum(), pageParam.getPageSize());
        }
        StudentActionTrans studentActionTransFilter = StudentActionTrans.INSTANCE.toModel(studentActionTransDtoFilter);
        String orderBy = MyOrderParam.buildOrderBy(orderParam, StudentActionTrans.class);
        List<StudentActionTrans> studentActionTransList =
                studentActionTransService.getStudentActionTransListWithRelation(studentActionTransFilter, orderBy);
        long totalCount = 0L;
        if (studentActionTransList instanceof Page) {
            totalCount = ((Page<StudentActionTrans>) studentActionTransList).getTotal();
        }
        // 分页连同对象数据转换copy工作，下面的方法一并完成。
        Tuple2<List<StudentActionTransDto>, Long> responseData =
                new Tuple2<>(StudentActionTrans.INSTANCE.fromModelList(studentActionTransList), totalCount);
        return ResponseResult.success(MyPageUtil.makeResponseData(responseData));
    }

    /**
     * 查看指定学生行为流水对象详情。
     *
     * @param transId 指定对象主键Id。
     * @return 应答结果对象，包含对象详情。
     */
    @GetMapping("/view")
    public ResponseResult<StudentActionTransDto> view(@RequestParam Long transId) {
        if (MyCommonUtil.existBlankArgument(transId)) {
            return ResponseResult.error(ErrorCodeEnum.ARGUMENT_NULL_EXIST);
        }
        StudentActionTrans studentActionTrans =
                studentActionTransService.getByIdWithRelation(transId, MyRelationParam.full());
        if (studentActionTrans == null) {
            return ResponseResult.error(ErrorCodeEnum.DATA_NOT_EXIST);
        }
        StudentActionTransDto studentActionTransDto = StudentActionTrans.INSTANCE.fromModel(studentActionTrans);
        return ResponseResult.success(studentActionTransDto);
    }

    /**
     * 根据主键Id集合，获取数据对象集合。仅限于微服务间远程接口调用。
     *
     * @param transIds 主键Id集合。
     * @param withDict 是否包含字典关联。
     * @return 应答结果对象，包含主对象集合。
     */
    @PostMapping("/listByIds")
    public ResponseResult<List<StudentActionTransDto>> listByIds(
            @RequestParam Set<Long> transIds, @RequestParam Boolean withDict) {
        return super.baseListByIds(transIds, withDict, StudentActionTrans.INSTANCE);
    }

    /**
     * 根据主键Id，获取数据对象。仅限于微服务间远程接口调用。
     *
     * @param transId 主键Id。
     * @param withDict 是否包含字典关联。
     * @return 应答结果对象，包含主对象数据。
     */
    @PostMapping("/getById")
    public ResponseResult<StudentActionTransDto> getById(
            @RequestParam Long transId, @RequestParam Boolean withDict) {
        return super.baseGetById(transId, withDict, StudentActionTrans.INSTANCE);
    }

    /**
     * 判断参数列表中指定的主键Id集合，是否全部存在。仅限于微服务间远程接口调用。
     *
     * @param transIds 主键Id集合。
     * @return 应答结果对象，包含true全部存在，否则false。
     */
    @PostMapping("/existIds")
    public ResponseResult<Boolean> existIds(@RequestParam Set<Long> transIds) {
        return super.baseExistIds(transIds);
    }

    /**
     * 判断参数列表中指定的主键Id是否存在。仅限于微服务间远程接口调用。
     *
     * @param transId 主键Id。
     * @return 应答结果对象，包含true表示存在，否则false。
     */
    @PostMapping("/existId")
    public ResponseResult<Boolean> existId(@RequestParam Long transId) {
        return super.baseExistId(transId);
    }

    /**
     * 复杂的查询调用，包括(in list)过滤，对象条件过滤，分组和排序等。主要用于微服务间远程过程调用。
     *
     * @param queryParam 查询参数。
     * @return 应答结果对象，包含符合查询过滤条件的对象结果集。
     */
    @PostMapping("/listBy")
    public ResponseResult<List<StudentActionTransDto>> listBy(@RequestBody MyQueryParam queryParam) {
        return super.baseListBy(queryParam, StudentActionTrans.INSTANCE);
    }

    /**
     * 复杂的查询调用，包括(in list)过滤，对象条件过滤，分组和排序等。主要用于微服务间远程过程调用。
     *
     * @param queryParam 查询参数。
     * @return 应答结果对象，包含符合查询过滤条件的对象结果集。
     */
    @PostMapping("/listMapBy")
    public ResponseResult<List<Map<String, Object>>> listMapBy(@RequestBody MyQueryParam queryParam) {
        return super.baseListMapBy(queryParam, StudentActionTrans.INSTANCE);
    }

    /**
     * 复杂的查询调用，仅返回单体记录。主要用于微服务间远程过程调用。
     *
     * @param queryParam 查询参数。
     * @return 应答结果对象，包含符合查询过滤条件的对象结果集。
     */
    @PostMapping("/getBy")
    public ResponseResult<StudentActionTransDto> getBy(@RequestBody MyQueryParam queryParam) {
        return super.baseGetBy(queryParam, StudentActionTrans.INSTANCE);
    }

    /**
     * 获取远程主对象中符合查询条件的数据数量。主要用于微服务间远程过程调用。
     *
     * @param queryParam 查询参数。
     * @return 应答结果对象，包含结果数量。
     */
    @PostMapping("/countBy")
    public ResponseResult<Integer> countBy(@RequestBody MyQueryParam queryParam) {
        return super.baseCountBy(queryParam);
    }

    /**
     * 获取远程对象中符合查询条件的分组聚合计算Map列表。
     *
     * @param aggregationParam 聚合参数。
     * @return 应该结果对象，包含聚合计算后的分组Map列表。
     */
    @PostMapping("/aggregateBy")
    public ResponseResult<List<Map<String, Object>>> aggregateBy(@RequestBody MyAggregationParam aggregationParam) {
        return super.baseAggregateBy(aggregationParam);
    }
}
