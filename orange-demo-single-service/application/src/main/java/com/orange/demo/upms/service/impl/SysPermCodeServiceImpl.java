package com.orange.demo.upms.service.impl;

import com.alibaba.fastjson.JSONObject;
import com.orange.demo.common.core.base.service.BaseService;
import com.orange.demo.common.sequence.wrapper.IdGeneratorWrapper;
import com.orange.demo.common.core.base.dao.BaseDaoMapper;
import com.orange.demo.common.core.constant.GlobalDeletedFlag;
import com.orange.demo.common.core.util.MyModelUtil;
import com.orange.demo.common.core.object.CallResult;
import com.orange.demo.upms.dao.SysMenuPermCodeMapper;
import com.orange.demo.upms.dao.SysPermCodeMapper;
import com.orange.demo.upms.dao.SysPermCodePermMapper;
import com.orange.demo.upms.model.SysMenuPermCode;
import com.orange.demo.upms.model.SysPermCode;
import com.orange.demo.upms.model.SysPermCodePerm;
import com.orange.demo.upms.service.SysPermCodeService;
import com.orange.demo.upms.service.SysPermService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 权限字数据服务类。
 *
 * @author Jerry
 * @date 2020-09-24
 */
@Service("sysPermCodeService")
public class SysPermCodeServiceImpl extends BaseService<SysPermCode, Long> implements SysPermCodeService {

    @Autowired
    private SysPermCodeMapper sysPermCodeMapper;
    @Autowired
    private SysPermCodePermMapper sysPermCodePermMapper;
    @Autowired
    private SysMenuPermCodeMapper sysMenuPermCodeMapper;
    @Autowired
    private SysPermService sysPermService;
    @Autowired
    private IdGeneratorWrapper idGenerator;

    /**
     * 返回主对象的Mapper对象。
     *
     * @return 主对象的Mapper对象。
     */
    @Override
    protected BaseDaoMapper<SysPermCode> mapper() {
        return sysPermCodeMapper;
    }

    /**
     * 获取指定用户的权限字列表。
     *
     * @param userId 用户主键Id。
     * @return 用户关联的权限字列表。
     */
    @Override
    public List<String> getPermCodeListByUserId(Long userId) {
        return sysPermCodeMapper.getPermCodeListByUserId(userId);
    }

    /**
     * 保存新增的权限字对象。
     *
     * @param sysPermCode 新增的权限字对象。
     * @param permIdSet   权限资源Id列表。
     * @return 新增后的权限字对象。
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public SysPermCode saveNew(SysPermCode sysPermCode, Set<Long> permIdSet) {
        sysPermCode.setPermCodeId(idGenerator.nextLongId());
        MyModelUtil.fillCommonsForInsert(sysPermCode);
        sysPermCode.setDeletedFlag(GlobalDeletedFlag.NORMAL);
        sysPermCodeMapper.insert(sysPermCode);
        if (permIdSet != null) {
            List<SysPermCodePerm> sysPermCodePermList = new LinkedList<>();
            for (Long permId : permIdSet) {
                SysPermCodePerm permCodePerm = new SysPermCodePerm();
                permCodePerm.setPermCodeId(sysPermCode.getPermCodeId());
                permCodePerm.setPermId(permId);
                sysPermCodePermList.add(permCodePerm);
            }
            sysPermCodePermMapper.insertList(sysPermCodePermList);
        }
        return sysPermCode;
    }

    /**
     * 更新权限字对象。
     *
     * @param sysPermCode         更新的权限字对象。
     * @param originalSysPermCode 原有的权限字对象。
     * @param permIdSet           权限资源Id列表。
     * @return 更新成功返回true，否则false。
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public boolean update(SysPermCode sysPermCode, SysPermCode originalSysPermCode, Set<Long> permIdSet) {
        MyModelUtil.fillCommonsForUpdate(sysPermCode, originalSysPermCode);
        sysPermCode.setParentId(originalSysPermCode.getParentId());
        sysPermCode.setDeletedFlag(GlobalDeletedFlag.NORMAL);
        if (sysPermCodeMapper.updateByPrimaryKey(sysPermCode) != 1) {
            return false;
        }
        SysPermCodePerm deletedPermCodePerm = new SysPermCodePerm();
        deletedPermCodePerm.setPermCodeId(sysPermCode.getPermCodeId());
        sysPermCodePermMapper.delete(deletedPermCodePerm);
        if (permIdSet != null) {
            List<SysPermCodePerm> sysPermCodePermList = new LinkedList<>();
            for (Long permId : permIdSet) {
                SysPermCodePerm permCodePerm = new SysPermCodePerm();
                permCodePerm.setPermCodeId(sysPermCode.getPermCodeId());
                permCodePerm.setPermId(permId);
                sysPermCodePermList.add(permCodePerm);
            }
            sysPermCodePermMapper.insertList(sysPermCodePermList);
        }
        return true;
    }

    /**
     * 删除指定的权限字。
     *
     * @param permCodeId 权限字主键Id。
     * @return 删除成功返回true，否则false。
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public boolean remove(Long permCodeId) {
        if (!this.removeById(permCodeId)) {
            return false;
        }
        SysMenuPermCode menuPermCode = new SysMenuPermCode();
        menuPermCode.setPermCodeId(permCodeId);
        sysMenuPermCodeMapper.delete(menuPermCode);
        SysPermCodePerm permCodePerm = new SysPermCodePerm();
        permCodePerm.setPermCodeId(permCodeId);
        sysPermCodePermMapper.delete(permCodePerm);
        return true;
    }

    /**
     * 判断当前权限字是否存在下级权限字对象。
     *
     * @param permCodeId 权限字主键Id。
     * @return 存在返回true，否则false。
     */
    @Override
    public boolean hasChildren(Long permCodeId) {
        SysPermCode permCode = new SysPermCode();
        permCode.setParentId(permCodeId);
        return this.getCountByFilter(permCode) > 0;
    }

    /**
     * 验证权限字对象关联的数据是否都合法。
     *
     * @param sysPermCode         当前操作的对象。
     * @param originalSysPermCode 原有对象。
     * @param permIdListString    逗号分隔的权限资源Id列表。
     * @return 验证结果。
     */
    @Override
    public CallResult verifyRelatedData(
            SysPermCode sysPermCode, SysPermCode originalSysPermCode, String permIdListString) {
        if (this.needToVerify(sysPermCode, originalSysPermCode, SysPermCode::getParentId)) {
            if (getById(sysPermCode.getParentId()) == null) {
                return CallResult.error("数据验证失败，关联的上级权限字并不存在，请刷新后重试！");
            }
        }
        JSONObject jsonObject = null;
        if (StringUtils.isNotBlank(permIdListString)) {
            Set<Long> permIdSet = Arrays.stream(
                    permIdListString.split(",")).map(Long::valueOf).collect(Collectors.toSet());
            if (!sysPermService.existAllPrimaryKeys(permIdSet)) {
                return CallResult.error("数据验证失败，存在不合法的权限资源，请刷新后重试！");
            }
            jsonObject = new JSONObject();
            jsonObject.put("permIdSet", permIdSet);
        }
        return CallResult.ok(jsonObject);
    }

    /**
     * 查询权限字的用户列表。同时返回详细的分配路径。
     *
     * @param permCodeId 权限字Id。
     * @param loginName  登录名。
     * @return 包含从权限字到用户的完整权限分配路径信息的查询结果列表。
     */
    @Override
    public List<Map<String, Object>> getSysUserListWithDetail(Long permCodeId, String loginName) {
        return sysPermCodeMapper.getSysUserListWithDetail(permCodeId, loginName);
    }

    /**
     * 查询权限字的角色列表。同时返回详细的分配路径。
     *
     * @param permCodeId 权限字Id。
     * @param roleName   角色名。
     * @return 包含从权限字到角色的权限分配路径信息的查询结果列表。
     */
    @Override
    public List<Map<String, Object>> getSysRoleListWithDetail(Long permCodeId, String roleName) {
        return sysPermCodeMapper.getSysRoleListWithDetail(permCodeId, roleName);
    }
}
