package com.orangeforms.common.flow.constant;

/**
 * 内置的流程审批状态。
 *
 * @author Jerry
 * @date 2024-07-02
 */
public class FlowBuiltinApprovalStatus {

    /**
     * 同意。
     */
    public static final int AGREED = 1;
    /**
     * 拒绝。
     */
    public static final int REFUSED = 2;
    /**
     * 会签同意。
     */
    public static final int MULTI_AGREED = 3;
    /**
     * 会签拒绝。
     */
    public static final int MULTI_REFUSED = 4;

    /**
     * 私有构造函数，明确标识该常量类的作用。
     */
    private FlowBuiltinApprovalStatus() {
    }
}
