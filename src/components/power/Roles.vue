<template>
  <div>
    <!-- 麵包屑導航區 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首頁</el-breadcrumb-item>
      <el-breadcrumb-item>權限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片視圖 -->
    <el-card>
      <!-- 添加角色按鈕 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>

      <!-- 角色列表 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展開列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一級權限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二級和三級權限 -->
              <el-col :span="19">
                <!-- 渲染二級權限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名稱" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
              >編輯</el-button
            >
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
              >刪除</el-button
            >
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
              >分配權限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色對話框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 內容主體區 -->
      <el-form
        :model="addRolesForm"
        :rules="addFormRules"
        ref="addRolesFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名稱" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部區 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">確 定</el-button>
      </span>
    </el-dialog>

    <!-- 編輯角色的對話框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editRolesForm"
        :rules="editFormRules"
        ref="editRolesFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名稱">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">確 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配權限的對話框 -->
    <el-dialog
      title="分配權限"
      :visible.sync="SetRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 樹形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="SetRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">確 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Roles",
  data() {
    return {
      // 所有角色列表數據
      rolesList: [],
      // 所有權限的數據
      rightsList: [],
      // 控制添加角色對話框的顯示與隱藏
      addDialogVisible: false,
      // 控制編輯角色對話框的顯示與隱藏
      editDialogVisible: false,
      // 控制分配權限對話框的顯示與隱藏
      SetRightDialogVisible: false,
      // 添加角色表單數據
      addRolesForm: {
        roleName: "",
        roleDesc: "",
      },
      // 添加表單的驗證規則
      addFormRules: {
        roleName: [
          { required: true, message: "請輸入角色名", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "角色名長度在2-10個字符之間",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: true, message: "請輸入角色描述", trigger: "blur" },
        ],
      },
      // 編輯角色表單
      editRolesForm: {},
      // 編輯表單的驗證規則
      editFormRules: {
        roleName: [
          { required: true, message: "請輸入角色名", trigger: "blur" },
          {
            min: 2,
            max: 10,
            message: "角色名長度在2-10個字符之間",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: true, message: "請輸入角色描述", trigger: "blur" },
        ],
      },
      // 樹形控件的屬性綁定對象
      treeProps: {
        label: "authName",
        children: "children",
      },
      // 默認勾選的節點id值
      defKeys: [],
      // 當前選中分配權限的角色id
      roleId: "",
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 獲取所有角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");

      if (res.meta.status !== 200) {
        return this.$message.error("獲取角色列表失敗!");
      }

      this.rolesList = res.data;
      console.log(this.rolesList);
    },
    // 監聽添加對話框的關閉事件
    addDialogClosed() {
      this.$refs.addRolesFormRef.resetFields();
    },
    // 監聽修改對話框的關閉事件
    editDialogClosed() {
      this.$refs.editRolesFormRef.resetFields();
    },
    // 添加角色
    addRole() {
      this.$refs.addRolesFormRef.validate(async (valid) => {
        if (!valid) return;
        // 通過預驗證, 發起添加角色的請求
        const { data: res } = await this.$http.post("roles", this.addRolesForm);

        if (res.meta.status !== 201) {
          return this.$message.error("新增角色失敗!");
        }

        this.$message.success("新增角色成功!");
        this.addDialogVisible = false;
        this.getRolesList();
      });
    },
    // 展示編輯角色的對話框
    async showEditDialog(id) {
      // 從id拿到該角色的訊息
      const { data: res } = await this.$http.get("roles/" + id);

      if (res.meta.status !== 200) {
        return this.$message.error("查詢角色失敗!");
      }

      this.editRolesForm = res.data;
      this.editDialogVisible = true;
    },
    // 修改角色資料並提交
    async editRoleInfo() {
      this.$refs.editRolesFormRef.validate(async (valid) => {
        if (!valid) return;

        const { data: res } = await this.$http.put(
          "roles/" + this.editRolesForm.roleId,
          {
            roleName: this.editRolesForm.roleName,
            roleDesc: this.editRolesForm.roleDesc,
          }
        );

        if (res.meta.status !== 200) {
          return this.$message.error("修改失敗!");
        }

        this.editDialogVisible = false;
        this.getRolesList();
        this.$message.success("修改成功!");
      });
    },
    // 根據id刪除對應的角色
    async removeUserById(id) {
      // 彈框警告用戶是否刪除
      const confirmResult = await this.$confirm(
        "此操作將永久刪除該角色, 是否繼續?",
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

      const { data: res } = await this.$http.delete("roles/" + id);

      if (res.meta.status !== 200) {
        return this.$message.error("刪除角色失敗! ");
      }

      this.$message.success("刪除角色成功! ");
      this.getRolesList();
    },
    // 根據id刪除對應的權限
    async removeRightById(role, rightId) {
      // 彈框警告用戶是否刪除
      const confirmResult = await this.$confirm(
        "此操作將永久刪除該權限, 是否繼續?",
        "提示",
        {
          confirmButtonText: "刪除",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("取消了刪除操作");
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );

      if (res.meta.status !== 200) {
        return this.$message.error("刪除權限失敗! ");
      }

      // this.getRolesList();
      // 直接將最新權限賦值進去, 這樣才不會導致畫面刷新
      role.children = res.data;
    },
    // 展示分配權限的對話框
    async showSetRightDialog(role) {
      // 把選中的角色id存到roleId
      this.roleId = role.id;
      // 獲取所有權限的數據
      const { data: res } = await this.$http.get("rights/tree");

      if (res.meta.status !== 200) {
        return this.$message.error("獲取權限失敗!");
      }
      // 把獲取到的權限數據保存到 data 中
      this.rightsList = res.data;

      // 遞迴獲取三級節點的id
      this.getLeafKeys(role, this.defKeys);

      this.SetRightDialogVisible = true;
    },
    // 通過遞回的形式, 獲取角色下的所有三級權限的id, 並保存到 defKeys
    getLeafKeys(node, arr) {
      // 如果當前node節點不包含children屬性, 則為三級節點
      if (!node.children) {
        return arr.push(node.id);
      }

      node.children.forEach((item) => {
        this.getLeafKeys(item, arr);
      });
    },
    // 監聽分配權限對話框的關閉事件
    setRightDialogClosed() {
      // 清空defKeys
      this.defKeys = [];
    },
    // 點擊為角色分配權限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];

      const idStr = keys.join(",");

      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );

      if (res.meta.status !== 200) {
        return this.$message.error("分配權限失敗! ");
      }

      this.$message.success("分配權限成功! ");
      this.getRolesList();
      this.SetRightDialogVisible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
