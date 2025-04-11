import { useState } from "react";
import styles from "./ActiveDirectoryMappingForm.module.css";
import { validateEmail } from "../../../../../utils/helpers";

import valid from "../../../../../assets/icons/valid.svg";
import invalid from "../../../../../assets/icons/invalid.svg";
import { Tooltip } from "react-tooltip";
import SelectDropdown from "../../../dropdowns/SelectDropdown/SelectDropdown";

function ActiveDirectoryMappingForm() {
  const [selectUsers, setSelectUsers] = useState(false);

  const items = ["Unit", "Unit", "Unit", "Unit", "Unit"];

  const users = [
    {
      value: "abram@gmail.com",
      isSelected: false,
      isValid: validateEmail("abram@gmail.com"),
    },
    {
      value: "abram@gmail.com",
      isSelected: false,
      isValid: validateEmail("abram@gmail.com"),
    },
    {
      value: "abram@gmail.com",
      isSelected: false,
      isValid: validateEmail("abram@gmail.com"),
    },
    {
      value: "abram@gmail.com",
      isSelected: false,
      isValid: validateEmail("abram@gmail.com"),
    },
    {
      value: "abram@gmail.com",
      isSelected: false,
      isValid: validateEmail("abram@gmail.com"),
    },
    {
      value: "abram@gmail.com",
      isSelected: false,
      isValid: validateEmail("abram@gmail.com"),
    },
    {
      value: "abram@gmail.com",
      isSelected: false,
      isValid: validateEmail("abram@gmail.com"),
    },
  ];

  const [allUsers, setAllUSers] = useState(users);

  function handleInputChange(index, value) {
    setAllUSers(
      allUsers.map((user, i) => {
        if (index == i)
          return { ...user, value, isValid: validateEmail(value) };
        else return user;
      })
    );
  }

  function handleEmailSelect(index) {
    setAllUSers(
      allUsers.map((user, i) => {
        if (index == i) return { ...user, isSelected: !user.isSelected };
        else return user;
      })
    );
  }

  return (
    <form className="flex flex-col gap-6">
      <div>
        <h3 className="text-xl font-semibold">Source</h3>
        <p>
          This allows you to limit the synchronization to certain parts of the
          AD
        </p>
      </div>
      <div className="border-y border-[#A1A1A1] py-5 flex flex-col gap-6">
        <section className="space-y-2">
          <h4 className="font-semibold text-lg">User and group mapping</h4>
          <div className="flex gap-6">
            {" "}
            {/* fields */}
            <SelectDropdown
              label="Domain"
              placeholder="Choose domain"
              items={items}
            />
            <SelectDropdown
              label="Organizational unit"
              placeholder="Choose unit"
              items={items}
            />
            <SelectDropdown
              label="User group"
              placeholder="Choose user group"
              items={items}
            />
          </div>
        </section>
      </div>
      <section className="flex flex-col gap-4">
        {selectUsers && (
          <div>
            <div className="text-lg font-semibold">
              12 users found in active directory
            </div>
            <div className="flex gap-3 items-center">
              <input type="checkbox" />
              <span className="">Include nested groups</span>
            </div>
          </div>
        )}
        <div>
          <div className="flex justify-between items-center">
            <div
              onClick={(e) => setSelectUsers(!selectUsers)}
              className="flex gap-3 items-center cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectUsers}
                className="cursor-pointer"
              />
              <span className="font-semibold text-lg">
                Select users to import
              </span>
            </div>
            {selectUsers && (
              <span className="font-semibold">
                Total selected: {allUsers.length}
              </span>
            )}
          </div>
          {selectUsers && (
            <ul>
              {allUsers.map((email, i) => {
                return (
                  <li
                    key={i}
                    className="border-b border-b-[#D3D3D3] flex items-center gap-2 py-3"
                  >
                    <span>{i + 1}.</span>
                    <input
                      type="checkbox"
                      checked={email.isSelected}
                      onChange={(e) => handleEmailSelect(i)}
                    />
                    <div className="grow rounded-lg border border-border-gray overflow-hidden relative">
                      <input
                        type="text"
                        value={email.value}
                        onChange={(e) => handleInputChange(i, e.target.value)}
                        className="w-full p-3 pr-9 outline-none"
                      />
                      <div className="absolute top-[calc(50%_-_9px)] right-3 cursor-pointer">
                        <span
                          data-tooltip-id="email-status"
                          data-tooltip-content={
                            email.isValid ? "Valid" : "Invalid"
                          }
                        >
                          <img
                            src={email.isValid ? valid : invalid}
                            alt=""
                            className=""
                          />
                        </span>
                        <Tooltip id="email-status" />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </form>
  );
}

export default ActiveDirectoryMappingForm;
