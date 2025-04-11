import PermissionReviewList from "../../../PermissionReviewList/PermissionReviewList";
import styles from "./CreateUserGroupReview.module.css";

function CreateUserGroupReview({ formData, setCurrentStep, permissions }) {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h3 className="text-xl font-semibold">Final review</h3>
        <p>Quick look at everything before you save this user group</p>
      </div>
      <div className="flex flex-col gap-4">
        {" "}
        {/* basic info */}
        <div className="flex items-center pr-24">
          <h4 className="text-lg font-semibold grow">Basic information</h4>
          <span
            className="text-sm text-text-pink cursor-pointer"
            onClick={() => setCurrentStep(1)}
          >
            Edit
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold">Group name</span>
          <span>{formData.name}</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold">Group description</span>
          <span>{formData.description}</span>
        </div>
      </div>
      <hr className="h-[1px] bg-[#D0D0D0]" />
      <div className="flex flex-col gap-4">
        {" "}
        {/* permssions */}
        <div className="flex items-center pr-24">
          <h4 className="text-lg font-semibold grow">Permissions</h4>
          <span
            className="text-sm text-text-pink cursor-pointer"
            onClick={() => setCurrentStep(2)}
          >
            Edit
          </span>
        </div>
        <div className="flex flex-col gap-3">
          <PermissionReviewList permissions={permissions} allowed={true} />
        </div>
        <div className="flex flex-col gap-3">
          <PermissionReviewList permissions={permissions} allowed={false} />
        </div>
      </div>
    </section>
  );
}

export default CreateUserGroupReview;
