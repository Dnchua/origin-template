package com.orange.demo.common.core.object;

import lombok.Builder;
import lombok.Data;

/**
 * 实体对象数据组装参数构建器。
 * BaseService中的实体对象数据组装函数，会根据该参数对象进行数据组装。
 *
 * @author Jerry
 * @date 2020-10-19
 */
@Data
@Builder
public class MyRelationParam {

    /**
     * 是否组装字典关联的标记。
     * 组装RelationDict和RelationConstDict注解标记的字段。
     */
    private boolean buildDict;

    /**
     * 是否组装远程字典关联的标记。
     * 组装RelationDict和RelationConstDict注解标记的字段。
     */
    private boolean buildRemoteDict;

    /**
     * 是否组装一对一关联的标记。
     * 组装RelationOneToOne注解标记的字段。
     */
    private boolean buildOneToOne;

    /**
     * 是否组装远程一对一关联的标记。
     * 组装RelationOneToOne注解标记的字段。
     */
    private boolean buildRemoteOneToOne;

    /**
     * 在组装一对一关联的同时，是否继续关联从表中的字典。
     * 从表中RelationDict和RelationConstDict注解标记的字段。
     * 该字段为true时，无需设置buildOneToOne了。
     */
    private boolean buildOneToOneWithDict;

    /**
     * 在组装远程一对一关联的同时，是否继续关联从表中的字典。
     * 从表中RelationDict和RelationConstDict注解标记的字段。
     * 该字段为true时，无需设置buildOneToOne了。
     */
    private boolean buildRemoteOneToOneWithDict;

    /**
     * 是否组装主表对多对多中间表关联的标记。
     * 组装RelationManyToMany注解标记的字段。
     */
    private boolean buildManyToManyRelation;

    /**
     * 是否组装聚合计算关联的标记。
     * 组装RelationOneToManyAggregation和RelationManyToManyAggregation注解标记的字段。
     */
    private boolean buildAggregation;

    /**
     * 是否组装远程聚合计算关联的标记。
     * 组装RelationOneToManyAggregation和RelationManyToManyAggregation注解标记的字段。
     */
    private boolean buildRemoteAggregation;

    /**
     * 便捷方法，返回仅做字典关联的参数对象。
     *
     * @return 返回仅做字典关联的参数对象。
     */
    public static MyRelationParam dictOnly() {
        return MyRelationParam.builder().buildDict(true).buildRemoteDict(true).build();
    }

    /**
     * 便捷方法，返回仅做字典关联、一对一从表及其字典和聚合计算的参数对象。
     * NOTE: 对于一对多和多对多，这种从表数据是列表结果的关联，均不返回。
     *
     * @return 返回仅做字典关联、一对一从表及其字典和聚合计算的参数对象。
     */
    public static MyRelationParam normal() {
        return MyRelationParam.builder()
                .buildDict(true)
                .buildRemoteDict(true)
                .buildOneToOneWithDict(true)
                .buildRemoteOneToOneWithDict(true)
                .buildAggregation(true)
                .buildRemoteAggregation(true)
                .build();
    }

    /**
     * 便捷方法，返回全部关联的参数对象。
     *
     * @return 返回全部关联的参数对象。
     */
    public static MyRelationParam full() {
        return MyRelationParam.builder()
                .buildDict(true)
                .buildRemoteDict(true)
                .buildOneToOneWithDict(true)
                .buildRemoteOneToOneWithDict(true)
                .buildAggregation(true)
                .buildRemoteAggregation(true)
                .buildManyToManyRelation(true)
                .build();
    }
}
