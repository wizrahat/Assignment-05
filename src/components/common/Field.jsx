import React from "react";

const Field = ({ label, children, htmlFor, error }) => {
  const id = htmlFor || getChildId(children);

  return (
    <>
      {label && (
        <label htmlFor={id} className="block mb-2">
          {label}
        </label>
      )}
      {children}
      {!!error && (
        <div role="alert" className="text-red-500">
          {error.message}
        </div>
      )}
    </>
  );
};

const getChildId = (children) => {
  const childArray = React.Children.toArray(children);
  const child = childArray[0];

  // Check if child is defined and has props before accessing id
  if (child && child.props && "id" in child.props) {
    return child.props.id;
  }

  return undefined; // Return undefined if no id is found
};

export default Field;
