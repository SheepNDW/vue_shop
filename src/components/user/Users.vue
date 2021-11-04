<template>
  <div>
    <!-- 麵包屑導航區 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首頁</el-breadcrumb-item>
      <el-breadcrumb-item>用戶管理</el-breadcrumb-item>
      <el-breadcrumb-item>用戶列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片視圖區 -->
    <el-card>
      <!-- 搜索與添加區 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="請輸入內容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用戶</el-button
          >
        </el-col>
      </el-row>

      <!-- 用戶列表區 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="信箱" prop="email"></el-table-column>
        <el-table-column label="電話" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="狀態">
          <template v-slot="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="scope">
            <!-- 編輯按鈕 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 刪除按鈕 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按鈕 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁區 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用戶的對話框 -->
    <el-dialog
      title="添加用戶"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 內容主體區 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用戶名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密碼" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="信箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手機" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部區 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">確 定</el-button>
      </span>
    </el-dialog>

    <!-- 編輯用戶的對話框 -->
    <el-dialog
      title="修改用戶資料"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用戶名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="信箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手機" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">確 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的對話框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
      @close="setRoleDialogClosed"
    >
      <div>
        <p>當前用戶： {{ userInfo.username }}</p>
        <p>當前角色： {{ userInfo.role_name }}</p>
        <p>
          分配新角色：
          <el-select v-model="selectedRoleId" placeholder="請選擇角色">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">確 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Users",
  data() {
    // 驗證信箱的規則
    var checkEmail = (rule, value, callback) => {
      // 驗證mail的正規表達式
      const regEmail = /^\w+@\w+(\.\w+)+$/;

      if (regEmail.test(value)) {
        // 合法的信箱
        return callback();
      }

      callback(new Error("請輸入正確的信箱格式"));
    };

    // 驗證手機號碼的規則
    var checkMobile = (rule, value, callback) => {
      // 驗證手機號的正規表達式
      const regMobile = /^09\d{8}$/;

      if (regMobile.test(value)) {
        return callback();
      }

      callback(new Error("請輸入正確的手機號碼"));
    };

    return {
      // 獲取用戶列表的參數物件
      queryInfo: {
        query: "",
        // 當前頁數
        pagenum: 1,
        // 每次顯示多少條
        pagesize: 5,
      },
      userList: [],
      total: 0,
      // 控制添加用戶對話框的顯示與隱藏
      addDialogVisible: false,
      // 控制編輯用戶對話框的顯示與隱藏
      editDialogVisible: false,
      // 控制分配角色對話框的顯示與隱藏
      setRoleDialogVisible: false,
      // 添加用戶的表單數據
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      // 添加表單的驗證規則
      addFormRules: {
        username: [
          { required: true, message: "請輸入用戶名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用戶名長度在3-10個字符之間",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "請輸入密碼", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "密碼長度在6-15個字符之間",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "請輸入電子信箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "請輸入手機號碼", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      // 查詢到的用戶信息
      editForm: {},
      // 修改表單的驗證規則
      editFormRules: {
        email: [
          { required: true, message: "請輸入電子信箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "請輸入手機號碼", trigger: "blur" },
          // { validator: checkMobile, trigger: "blur" },
        ],
      },
      // 需要被分配角色的用戶資料
      userInfo: {},
      // 所有角色的數據列表
      rolesList: [],
      // 已選中的角色id值
      selectedRoleId: "",
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("獲取用戶列表失敗! ");
      }
      this.userList = res.data.users;
      this.total = res.data.total;
    },
    // 監聽 pagesize 改變的事件
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 監聽 頁碼值 改變的事件
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 監聽 switch 開關狀態的改變
    async userStateChanged(userInfo) {
      console.log(userInfo);
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        // 失敗要還原狀態 把 mg_state 取反回去
        userInfo.mg_state = !userInfo.mg_state;
        return this.$message.error("更新用戶狀態失敗!");
      }
      this.$message.success("更新用戶狀態成功!");
    },
    // 監聽添加對話框的關閉事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 新增新用戶
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        // 通過預驗證, 發起添加用戶的請求
        const { data: res } = await this.$http.post("users", this.addForm);

        if (res.meta.status !== 201) {
          this.$message.error("添加失敗!");
        }

        this.$message.success("添加成功!");
        // 關閉對話框
        this.addDialogVisible = false;
        // 重新獲取用戶列表
        this.getUserList();
      });
    },
    // 展示編輯用戶的對話框
    async showEditDialog(id) {
      // console.log(id);
      const { data: res } = await this.$http.get("users/" + id);

      if (res.meta.status !== 200) {
        return this.$message.error("查詢用戶失敗!");
      }

      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 監聽修改對話框的關閉事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 修改用戶資料並提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        // 通過則發起修改請求
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        );

        if (res.meta.status !== 200) {
          return this.$message.error("更新失敗!");
        }

        // 關閉對話框
        this.editDialogVisible = false;
        // 刷新數據
        this.getUserList();
        // 提示修改成功
        this.$message.success("更新成功!");
      });
    },
    // 根據id刪除對應的用戶
    async removeUserById(id) {
      // 彈框警告用戶是否刪除
      const confirmResult = await this.$confirm(
        "此操作將永久刪除該用戶, 是否繼續?",
        "提示",
        {
          confirmButtonText: "刪除",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      // 如果確認刪除, 則返回字符串 confirm
      // 如果取消刪除, 則返回字符串 cancel
      // console.log(confirmResult)
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消刪除操作");
      }

      const { data: res } = await this.$http.delete("users/" + id);

      if (res.meta.status !== 200) {
        return this.$message.error("刪除用戶失敗! ");
      }

      this.$message.success("刪除用戶成功! ");
      this.getUserList();
    },
    // 展示分配角色的對話框
    async setRole(userInfo) {
      this.userInfo = userInfo;

      // 在展示對話框之前, 獲取所有角色的列表
      const { data: res } = await this.$http.get("roles");

      if (res.meta.status !== 200) {
        return this.$message.error("獲取角色列表失敗! ");
      }

      this.rolesList = res.data;

      this.setRoleDialogVisible = true;
    },
    // 點擊按鈕分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error("請選擇要分配的角色!");
      }

      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        { rid: this.selectedRoleId }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("更新角色失敗! ");
      }

      this.$message.success("更新角色成功! ");
      this.getUserList();
      this.setRoleDialogVisible = false;
    },
    // 監聽分配角色對話框的關閉事件
    setRoleDialogClosed() {
      this.selectedRoleId = "";
      this.userInfo = {};
    },
  },
};
</script>
