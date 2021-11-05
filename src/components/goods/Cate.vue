<template>
  <div>
    <!-- 麵包屑導航區 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首頁</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分類</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片視圖 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分類</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        class="tree-table"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template v-slot:isok="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: #47bf37"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template v-slot:order="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一級</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二級</el-tag
          >
          <el-tag size="mini" type="warning" v-else>三級</el-tag>
        </template>
        <!-- 操作 -->
        <template v-slot:opt="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showEditDialog(scope.row.cat_id)"
            >編輯</el-button
          >
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="removeCateById(scope.row.cat_id)"
            >刪除</el-button
          >
        </template>
      </tree-table>

      <!-- 分頁區 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分類的對話框 -->
    <el-dialog
      title="添加分類"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分類的表單 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分類名稱: " prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父級分類: ">
          <!-- options 用來指定數據源 -->
          <!-- props 用來指定配置對象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{
              expandTrigger: 'hover',
              checkStrictly: true,
              ...cascaderProps,
            }"
            @change="parentCateChanged"
            clearable
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">確 定</el-button>
      </span>
    </el-dialog>

    <!-- 編輯分類對話框 -->
    <el-dialog
      title="修改分類"
      :visible.sync="editCateDialogVisible"
      width="50%"
    >
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分類名稱" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">確 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Cate",
  data() {
    return {
      // 查詢條件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 商品分類的數據列表, 默認為空
      cateList: [],
      // 總數據條數
      total: 0,
      // 為table指定列的定義
      columns: [
        {
          label: "分類名稱",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          // 表示將當前列定義為模板列
          type: "template",
          // 表示當前這一列使用的模板名稱
          template: "isok",
        },
        {
          label: "排序",
          // 表示將當前列定義為模板列
          type: "template",
          // 表示當前這一列使用的模板名稱
          template: "order",
        },
        {
          label: "操作",
          // 表示將當前列定義為模板列
          type: "template",
          // 表示當前這一列使用的模板名稱
          template: "opt",
        },
      ],
      // 控制添加分類對話框的顯示與隱藏
      addCateDialogVisible: false,
      // 控制編輯分類對話框的顯示與隱藏
      editCateDialogVisible: false,
      // 添加分類的表單數據
      addCateForm: {
        // 將要添加的分類名稱
        cat_name: "",
        // 父級分類的id
        cat_pid: 0,
        // 分類的等級, 默認要添加的是一級分類
        cat_level: 0,
      },
      // 添加分類表單的驗證規則
      addCateFormRules: {
        cat_name: [
          { required: true, message: "請輸入分類的名稱", trigger: "blur" },
        ],
      },
      // 父級分類的列表
      parentCateList: [],
      // 指定級聯選擇器的配置對象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 選中的父級分類的id陣列
      selectedKeys: [],
      // 編輯分類的表單數據
      editCateForm: {},
      // 編輯分類表單的驗證規則
      editCateFormRules: {
        cat_name: [
          {
            required: true,
            message: "請輸入想修改分類的名稱",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 獲取商品分類數據
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });

      if (res.meta.status !== 200) {
        return this.$message.error("獲取商品分類失敗! ");
      }

      console.log(res.data);
      // 把數據列表賦值給cateList
      this.cateList = res.data.result;
      // 為總數據條數賦值
      this.total = res.data.total;
    },
    // 監聽 pagesize 改變
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 監聽 pagenum 改變
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 點擊按鈕, 展示添加分類的對話框
    showAddCateDialog() {
      // 先獲取父級分類的數據列表
      this.getParentCateList();
      // 再展示對話框
      this.addCateDialogVisible = true;
    },
    // 獲取父級分類的數據列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });

      if (res.meta.status !== 200) {
        return this.$message.error("獲取父級分類數據失敗! ");
      }

      // console.log(res.data);
      this.parentCateList = res.data;
    },
    // 選擇項發生變化觸發這個函數
    parentCateChanged() {
      console.log(this.selectedKeys);
      // 如果 selectedKeys 的 length 大於0, 證明選中了父級分類
      // 反之, 就說明沒有選中任何父級分類
      if (this.selectedKeys.length > 0) {
        // 父級分類的id
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1];
        // 為當前分類的等級賦值
        this.addCateForm.cat_level = this.selectedKeys.length;

        return;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    // 點擊按鈕, 添加新的分類
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );

        if (res.meta.status !== 201) {
          return this.$message.error("添加分類失敗! ");
        }

        this.$message.success("添加成功! ");
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    // 監聽添加分類對話框的關閉事件, 重置表單數據
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    // 點擊按鈕, 展示編輯分類的對話框
    async showEditDialog(cat_id) {
      // 從分類id拿到該分類的數據
      const { data: res } = await this.$http.get("categories/" + cat_id);

      if (res.meta.status !== 200) {
        return this.$message.error("查詢分類數據失敗! ");
      }

      this.editCateForm = res.data;
      // console.log(this.editCateForm);
      this.editCateDialogVisible = true;
    },
    // 點擊按鈕, 修改分類名稱
    editCateInfo() {
      this.$refs.editCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "categories/" + this.editCateForm.cat_id,
          { cat_name: this.editCateForm.cat_name }
        );

        if (res.meta.status !== 200) {
          return this.$message.error("修改失敗!");
        }

        this.$message.success("修改成功!");
        this.getCateList();
        this.editCateDialogVisible = false;
      });
    },
    // 點擊按鈕, 刪除分類名稱
    async removeCateById(id) {
      // 彈框警告用戶是否刪除
      const confirmResult = await this.$confirm(
        "此操作將永久刪除該分類, 是否繼續?",
        "提示",
        {
          confirmButtonText: "刪除",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("已取消刪除操作");
      }

      const { data: res } = await this.$http.delete("categories/" + id);

      if (res.meta.status !== 200) {
        return this.$message.error("刪除分類失敗! ");
      }

      this.$message.success("刪除分類成功! ");
      this.getCateList();
    },
  },
};
</script>

<style lang="scss" scoped>
.tree-table {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
