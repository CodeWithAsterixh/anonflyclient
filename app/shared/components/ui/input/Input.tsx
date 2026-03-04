import React, { forwardRef } from "react";
import type { InputProps } from "./types";
import { InputWrapper } from "./components/InputWrapper";
import { BaseInput } from "./components/BaseInput";
import { PasswordInput } from "./components/PasswordInput";
import { CheckableInput } from "./components/CheckableInput";
import { TextareaInput } from "./components/TextareaInput";

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  (
    {
      label,
      error,
      type = "text",
      leftIcon,
      rightIcon,
      containerClassName = "",
      labelClassName = "",
      className = "",
      helperText,
      id,
      multiline,
      ...props
    },
    ref
  ) => {
    const isPassword = type === "password";
    const isRadioOrCheckbox = type === "radio" || type === "checkbox";

    if (isRadioOrCheckbox) {
      return (
        <CheckableInput
          {...props}
          ref={ref as React.Ref<HTMLInputElement>}
          type={type}
          className={className}
          id={id}
        />
      );
    }

    const renderInput = () => {
      if (multiline) {
        return (
          <TextareaInput
            {...props as any}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            error={error}
            className={className}
            id={id}
          />
        );
      }

      if (isPassword) {
        return (
          <PasswordInput
            {...props}
            ref={ref as React.Ref<HTMLInputElement>}
            error={error}
            leftIcon={leftIcon}
            className={className}
            id={id}
          />
        );
      }

      return (
        <BaseInput
          {...props}
          ref={ref as React.Ref<HTMLInputElement>}
          type={type}
          error={error}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          className={className}
          id={id}
        />
      );
    };

    return (
      <InputWrapper
        label={label}
        error={error}
        helperText={helperText}
        id={id}
        containerClassName={containerClassName}
        labelClassName={labelClassName}
      >
        {renderInput()}
      </InputWrapper>
    );
  }
);

Input.displayName = "Input";

export default Input;
