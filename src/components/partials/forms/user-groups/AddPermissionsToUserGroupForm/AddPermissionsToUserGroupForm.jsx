import styles from "./AddPermissionsToUserGroupForm.module.css";

import SelectPermissionItem from "../../../SelectPermissionItem/SelectPermissionItem";

function AddPermissionsToUserGroupForm({
  permissions,
  setPermissions,
  mode,
  name,
}) {
  function toggleSelectAll(isChecked) {
    function toggleAll(perms) {
      perms.forEach((perm) => {
        perm.isSelected = isChecked;
        if (perm.children) {
          toggleAll(perm.children);
        }
      });
    }
    setPermissions((draft) => {
      toggleAll(draft);
    });
  }

  const permission_items = permissions.map((permission) => (
    <SelectPermissionItem
      key={permission.id}
      {...{ permission, setPermissions }}
      parentIsSelected={null}
      ancestors={[]}
    />
  ));

  return (
    <form className="flex flex-col gap-6">
      <div>
        <h3 className="text-xl font-semibold">
          {mode === "edit" ? "Edit" : "Select"} {name} permissions
        </h3>
        <p>Manage permissions for this user group</p>
      </div>
      <div className="flex flex-col gap-4">
        <h4 className="text-lg font-semibold">All system permissions</h4>
        <div className="bg-[#DEDEDE] rounded-t-lg py-5 px-4 flex">
          <label className="grow flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="select_all_permissions"
              onChange={(e) => toggleSelectAll(e.target.checked)}
            />
            <span className="text-[#1A1A1A]">Select all permissions</span>
          </label>
        </div>
        <div>
          <ul>{permission_items}</ul>
        </div>
      </div>
    </form>
  );
}

export default AddPermissionsToUserGroupForm;
