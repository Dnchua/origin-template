package com.orangeforms.webadmin.app.controller;

import cn.jimmyshi.beanquery.BeanQuery;
import com.orangeforms.common.log.annotation.OperationLog;
import com.orangeforms.common.log.model.constant.SysOperationLogType;
import com.github.pagehelper.page.PageMethod;
import com.orangeforms.webadmin.app.vo.*;
import com.orangeforms.webadmin.app.dto.*;
import com.orangeforms.webadmin.app.model.*;
import com.orangeforms.webadmin.app.service.*;
import com.orangeforms.common.core.object.*;
import com.orangeforms.common.core.util.*;
import com.orangeforms.common.core.constant.*;
import com.orangeforms.common.core.annotation.MyRequestBody;
import com.github.xiaoymin.knife4j.annotations.ApiOperationSupport;
import io.swagger.annotations.Api;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 学生数据操作控制器类。
 *
 * @author Jerry
 * @date 2020-09-24
 */
@Api(tags = "学生数据管理接口")
@Slf4j
@RestController
@RequestMapping("/admin/app/student")
public class StudentController {

    @Autowired
    private StudentService studentService;

    /**
     * 新增学生数据数据。
     *
     * @param studentDto 新增对象。
     * @return 应答结果对象，包含新增对象主键Id。
     */
    @ApiOperationSupport(ignoreParameters = {
            "studentDto.studentId",
            "studentDto.searchString",
            "studentDto.birthdayStart",
            "studentDto.birthdayEnd",
            "studentDto.registerTimeStart",
            "studentDto.registerTimeEnd"})
    @OperationLog(type = SysOperationLogType.ADD)
    @PostMapping("/add")
    public ResponseResult<Long> add(@MyRequestBody StudentDto studentDto) {
        String errorMessage = MyCommonUtil.getModelValidationError(studentDto, false);
        if (errorMessage != null) {
            return ResponseResult.error(ErrorCodeEnum.DATA_VALIDATED_FAILED, errorMessage);
        }
        Student student = MyModelUtil.copyTo(studentDto, Student.class);
        // 验证关联Id的数据合法性
        CallResult callResult = studentService.verifyRelatedData(student, null);
        if (!callResult.isSuccess()) {
            return ResponseResult.errorFrom(callResult);
        }
        student = studentService.saveNew(student);
        return ResponseResult.success(student.getStudentId());
    }

    /**
     * 更新学生数据数据。
     *
     * @param studentDto 更新对象。
     * @return 应答结果对象。
     */
    @ApiOperationSupport(ignoreParameters = {
            "studentDto.searchString",
            "studentDto.birthdayStart",
            "studentDto.birthdayEnd",
            "studentDto.registerTimeStart",
            "studentDto.registerTimeEnd"})
    @OperationLog(type = SysOperationLogType.UPDATE)
    @PostMapping("/update")
    public ResponseResult<Void> update(@MyRequestBody StudentDto studentDto) {
        String errorMessage = MyCommonUtil.getModelValidationError(studentDto, true);
        if (errorMessage != null) {
            return ResponseResult.error(ErrorCodeEnum.DATA_VALIDATED_FAILED, errorMessage);
        }
        Student student = MyModelUtil.copyTo(studentDto, Student.class);
        Student originalStudent = studentService.getById(student.getStudentId());
        if (originalStudent == null) {
            // NOTE: 修改下面方括号中的话述
            errorMessage = "数据验证失败，当前 [数据] 并不存在，请刷新后重试！";
            return ResponseResult.error(ErrorCodeEnum.DATA_NOT_EXIST, errorMessage);
        }
        // 验证关联Id的数据合法性
        CallResult callResult = studentService.verifyRelatedData(student, originalStudent);
        if (!callResult.isSuccess()) {
            return ResponseResult.errorFrom(callResult);
        }
        if (!studentService.update(student, originalStudent)) {
            return ResponseResult.error(ErrorCodeEnum.DATA_NOT_EXIST);
        }
        return ResponseResult.success();
    }

    /**
     * 删除学生数据数据。
     *
     * @param studentId 删除对象主键Id。
     * @return 应答结果对象。
     */
    @OperationLog(type = SysOperationLogType.DELETE)
    @PostMapping("/delete")
    public ResponseResult<Void> delete(@MyRequestBody Long studentId) {
        String errorMessage;
        if (MyCommonUtil.existBlankArgument(studentId)) {
            return ResponseResult.error(ErrorCodeEnum.ARGUMENT_NULL_EXIST);
        }
        return this.doDelete(studentId);
    }

    /**
     * 列出符合过滤条件的学生数据列表。
     *
     * @param studentDtoFilter 过滤对象。
     * @param orderParam 排序参数。
     * @param pageParam 分页参数。
     * @return 应答结果对象，包含查询结果集。
     */
    @PostMapping("/list")
    public ResponseResult<MyPageData<StudentVo>> list(
            @MyRequestBody StudentDto studentDtoFilter,
            @MyRequestBody MyOrderParam orderParam,
            @MyRequestBody MyPageParam pageParam) {
        if (pageParam != null) {
            PageMethod.startPage(pageParam.getPageNum(), pageParam.getPageSize());
        }
        Student studentFilter = MyModelUtil.copyTo(studentDtoFilter, Student.class);
        String orderBy = MyOrderParam.buildOrderBy(orderParam, Student.class);
        List<Student> studentList = studentService.getStudentListWithRelation(studentFilter, orderBy);
        return ResponseResult.success(MyPageUtil.makeResponseData(studentList, Student.INSTANCE));
    }

    /**
     * 查看指定学生数据对象详情。
     *
     * @param studentId 指定对象主键Id。
     * @return 应答结果对象，包含对象详情。
     */
    @GetMapping("/view")
    public ResponseResult<StudentVo> view(@RequestParam Long studentId) {
        if (MyCommonUtil.existBlankArgument(studentId)) {
            return ResponseResult.error(ErrorCodeEnum.ARGUMENT_NULL_EXIST);
        }
        Student student = studentService.getByIdWithRelation(studentId, MyRelationParam.full());
        if (student == null) {
            return ResponseResult.error(ErrorCodeEnum.DATA_NOT_EXIST);
        }
        StudentVo studentVo = Student.INSTANCE.fromModel(student);
        return ResponseResult.success(studentVo);
    }

    /**
     * 以字典形式返回全部学生数据数据集合。字典的键值为[studentId, studentName]。
     * 白名单接口，登录用户均可访问。
     *
     * @param filter 过滤对象。
     * @return 应答结果对象，包含的数据为 List<Map<String, String>>，map中包含两条记录，key的值分别是id和name，value对应具体数据。
     */
    @GetMapping("/listDict")
    public ResponseResult<List<Map<String, Object>>> listDict(Student filter) {
        List<Student> resultList = studentService.getListByFilter(filter);
        return ResponseResult.success(BeanQuery.select(
                "studentId as id", "studentName as name").executeFrom(resultList));
    }

    /**
     * 根据字典Id集合，获取查询后的字典数据。
     *
     * @param dictIds 字典Id集合。
     * @return 应答结果对象，包含字典形式的数据集合。
     */
    @PostMapping("/listDictByIds")
    public ResponseResult<List<Map<String, Object>>> listDictByIds(
            @MyRequestBody(elementType = Long.class) List<Long> dictIds) {
        List<Student> resultList = studentService.getInList(new HashSet<>(dictIds));
        return ResponseResult.success(BeanQuery.select(
                "studentId as id", "studentName as name").executeFrom(resultList));
    }

    private ResponseResult<Void> doDelete(Long studentId) {
        String errorMessage;
        // 验证关联Id的数据合法性
        Student originalStudent = studentService.getById(studentId);
        if (originalStudent == null) {
            // NOTE: 修改下面方括号中的话述
            errorMessage = "数据验证失败，当前 [对象] 并不存在，请刷新后重试！";
            return ResponseResult.error(ErrorCodeEnum.DATA_NOT_EXIST, errorMessage);
        }
        if (!studentService.remove(studentId)) {
            errorMessage = "数据操作失败，删除的对象不存在，请刷新后重试！";
            return ResponseResult.error(ErrorCodeEnum.DATA_NOT_EXIST, errorMessage);
        }
        return ResponseResult.success();
    }
}
