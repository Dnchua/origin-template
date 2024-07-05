package com.orangeforms.common.dbutil.object;

import cn.hutool.core.collection.CollUtil;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

/**
 * 直接从数据库获取的查询结果集对象。通常内部使用。
 *
 * @author Jerry
 * @date 2024-07-02
 */
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Data
public class SqlResultSet<T> extends GenericResultSet<SqlTableColumn, T> {

    public SqlResultSet(List<SqlTableColumn> columnMetaList, List<T> dataList) {
        super(columnMetaList, dataList);
    }

    public static <D> boolean isEmpty(SqlResultSet<D> rs) {
        return rs == null || CollUtil.isEmpty(rs.getDataList());
    }
}
