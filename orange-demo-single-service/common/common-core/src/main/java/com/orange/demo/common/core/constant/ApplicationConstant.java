package com.orange.demo.common.core.constant;

/**
 * 应用程序的常量声明对象。
 *
 * @author Jerry
 * @date 2020-10-19
 */
public final class ApplicationConstant {

    /**
     * 图片文件上传的父目录。
     */
    public static final String UPLOAD_IMAGE_PARENT_PATH = "image";
    /**
     * 附件文件上传的父目录。
     */
    public static final String UPLOAD_ATTACHMENT_PARENT_PATH = "attachment";
    /**
     * CSV文件扩展名。
     */
    public static final String CSV_EXT = "csv";
    /**
     * XLSX文件扩展名。
     */
    public static final String XLSX_EXT = "xlsx";
    /**
     * 统计分类计算时，按天聚合计算的常量值。(前端在MyOrderParam和MyGroupParam中传给后台)
     */
    public static final String DAY_AGGREGATION = "day";
    /**
     * 统计分类计算时，按月聚合计算的常量值。(前端在MyOrderParam和MyGroupParam中传给后台)
     */
    public static final String MONTH_AGGREGATION = "month";
    /**
     * 统计分类计算时，按年聚合计算的常量值。(前端在MyOrderParam和MyGroupParam中传给后台)
     */
    public static final String YEAR_AGGREGATION = "year";
    /**
     * 请求头跟踪id名。
     */
    public static final String HTTP_HEADER_TRACE_ID = "traceId";
    /**
     * 重要说明：该值为项目生成后的缺省密钥，仅为使用户可以快速上手并跑通流程。
     * 在实际的应用中，一定要为不同的项目或服务，自行生成公钥和私钥，并将 PRIVATE_KEY 的引用改为服务的配置项。
     * 密钥的生成方式，可通过执行common.core.util.RsaUtil类的main函数动态生成。
     */
    public static final String PRIVATE_KEY =
            "MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAKkLhAydtOtA4WuIkkIIUVaGWu4ElOEAQF9GTulHHWOwCHI1UvcKolvS1G+mdsKcmGtEAQ92AUde/kDRGu8Wn7kLDtCgUfo72soHz7Qfv5pVB4ohMxQd/9cxeKjKbDoirhB9Z3xGF20zUozp4ZPLxpTtI7azr0xzUtd5+D/HfLDrAgMBAAECgYEApESZhDz4YyeAJiPnpJ06lS8oS2VOWzsIUs0av5uoloeoHXtt7Lx7u2kroHeNrl3Hy2yg7ypH4dgQkGHin3VHrVAgjG3TxhgBXIqqntzzk2AGJKBeIIkRX86uTvtKZyp3flUgcwcGmpepAHS1V1DPY3aVYvbcqAmoL6DX6VYN0NECQQDQUitMdC76lEtAr5/ywS0nrZJDo6U7eQ7ywx/eiJ+YmrSye8oorlAj1VBWG+Cl6jdHOHtTQyYv/tu71fjzQiJTAkEAz7wb47/vcSUpNWQxItFpXz0o6rbJh71xmShn1AKP7XptOVZGlW9QRYEzHabV9m/DHqI00cMGhHrWZAhCiTkUCQJAFsJjaJ7o4weAkTieyO7B+CvGZw1h5/V55Jvcx3s1tH5yb22G0Jr6tm9/r2isSnQkReutzZLwgR3e886UvD7lcQJAAUcD2OOuQkDbPwPNtYwaHMbQgJj9JkOI9kskUE5vuiMdltOr/XFAyhygRtdmy2wmhAK1VnDfkmL6/IR8fEGImQJABOB0KCalb0M8CPnqqHzozrD8gPObnIIr4aVvLIPATN2g7MM2N6F7JbI4RZFiKa92LV6bhQCY8OvHi5K2cgFpbw==";
    /**
     * 私有构造函数，明确标识该常量类的作用。
     */
    private ApplicationConstant() {
    }
}
