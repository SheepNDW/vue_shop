<template>
  <div>
    <!-- 麵包屑導航區 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首頁</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片視圖 -->
    <el-card>
      <!-- 提示區 -->
      <el-alert
        title="添加商品資訊"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 進度條 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品參數"></el-step>
        <el-step title="商品屬性"></el-step>
        <el-step title="商品圖片"></el-step>
        <el-step title="商品內容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- Tab欄 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名稱" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品價格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品數量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分類" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="{ expandTrigger: 'hover', ...cateProps }"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品參數" name="1">
            <!-- 渲染表單的item項 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <!-- 複選框組 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品屬性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品圖片" name="3">
            <!-- action表示圖片要上傳到的後台api地址 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">點擊上傳</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品內容" name="4">
            <!-- 富文本編輯器組件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按鈕 -->
            <el-button type="primary" class="btn-add" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 圖片預覽 -->
    <el-dialog title="圖片預覽" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash";

export default {
  name: "Add",
  data() {
    return {
      activeIndex: "0",
      // 添加商品的表單數據
      addForm: {
        goods_name: "",
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所屬的分類
        goods_cat: [],
        // 圖片的陣列
        pics: [],
        // 商品的詳情描述
        goods_introduce: "",
        attrs: [],
      },
      // 表單驗證規則
      addFormRules: {
        goods_name: [
          { required: true, message: "請輸入商品名稱", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "請輸入商品價格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "請輸入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "請輸入商品數量", trigger: "blur" },
        ],
        goods_cat: [
          { required: true, message: "請選擇商品分類", trigger: "blur" },
        ],
      },
      // 商品分類列表
      cateList: [],
      cateProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      // 動態參數列表數據
      manyTableData: [],
      // 靜態屬性列表數據
      onlyTableData: [],
      // 上傳圖片的URL地址
      uploadURL: "https://lianghj.top:8888/api/private/v1/upload",
      // 圖片上傳組件的headers請求頭物件
      headersObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      previewPath: "",
      previewVisible: false,
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 獲取所有商品分類數據
    async getCateList() {
      const { data: res } = await this.$http.get("categories");

      if (res.meta.status !== 200) {
        return this.$message.error("獲取商品分類數據失敗! ");
      }

      this.cateList = res.data;
      console.log(this.cateList);
    },
    // 級聯選擇器選中項變化
    handleChange() {
      console.log(this.addForm.goods_cat);
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = [];
      }
    },
    beforeTabLeave(activeName, oldActiveName) {
      /* console.log("即將離開的標籤頁 " + oldActiveName);
      console.log("即將進入的標籤頁 " + activeName);
      return false; */
      if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
        this.$message.error("請先選擇商品分類! ");
        return false;
      }
    },
    async tabClicked() {
      // console.log(this.activeIndex);
      // 證明訪問的是動態參數面板
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" },
          }
        );

        if (res.meta.status !== 200) {
          return this.$message.error("獲取動態參數列表失敗! ");
        }

        console.log(res.data);
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(",");
        });
        this.manyTableData = res.data;
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" },
          }
        );

        if (res.meta.status !== 200) {
          return this.$message.error("獲取靜態屬性失敗! ");
        }

        console.log(res.data);
        this.onlyTableData = res.data;
      }
    },
    // 處理圖片預覽效果
    handlePreview(file) {
      console.log(file);
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    // 處理移除圖片的操作
    handleRemove(file) {
      // console.log(file);
      // 1. 獲取將要刪除圖片的臨時路徑
      const filePath = file.response.data.tmp_path;
      // 2. 從 pics 陣列中, 找到這個圖片對應的索引值
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath);
      // 3. 調用陣列的 splice 方法, 把圖片信息對象, 從 pics 陣列中移除
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm);
    },
    // 監聽圖片上傳成功的事件
    handleSuccess(response) {
      console.log(response);
      // 1. 拼接得到一個圖片信息對象
      const picInfo = { pic: response.data.tmp_path };
      // 2. 將圖片信息對象push到pics陣列中
      this.addForm.pics.push(picInfo);
      console.log(this.addForm);
    },
    // 添加商品
    async add() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error("請填寫所有必要的表單項");
        }
        // 執行添加的業務邏輯
        // lodash cloneDeep(obj)
        const form = _.cloneDeep(this.addForm);
        form.goods_cat = form.goods_cat.join(",");
        // 處理動態參數
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(","),
          };
          this.addForm.attrs.push(newInfo);
        });
        // 處理靜態屬性
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          };
          this.addForm.attrs.push(newInfo);
        });
        form.attrs = this.addForm.attrs;
        console.log(form);

        // 發起請求添加商品
        // 商品的名稱必須是唯一的
        const { data: res } = await this.$http.post("goods", form);
        if (res.meta.status !== 201) {
          return this.$message.error("添加商品失敗! ");
        }
        this.$message.success("添加商品成功! ");
        this.$router.push("/goods");
      });
    },
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2];
      }
      return null;
    },
  },
};
</script>

<style lang="scss" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.btn-add {
  margin-top: 15px;
}
</style>
