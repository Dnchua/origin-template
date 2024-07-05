package com.orangeforms.webadmin.upms.model;

import com.baomidou.mybatisplus.annotation.*;
import com.orangeforms.common.core.base.model.BaseModel;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 岗位实体对象。
 *
 * @author Jerry
 * @date 2024-07-02
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName(value = "zz_sys_post")
public class SysPost extends BaseModel {

    /**
     * 岗位Id。
     */
    @TableId(value = "post_id")
    private Long postId;

    /**
     * 岗位名称。
     */
    @TableField(value = "post_name")
    private String postName;

    /**
     * 岗位层级，数值越小级别越高。
     */
    @TableField(value = "post_level")
    private Integer postLevel;

    /**
     * 是否领导岗位。
     */
    @TableField(value = "leader_post")
    private Boolean leaderPost;

    /**
     * postId 的多对多关联表数据对象。
     */
    @TableField(exist = false)
    private SysDeptPost sysDeptPost;
}
