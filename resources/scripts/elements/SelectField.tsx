import { Field as FormikField, FieldProps } from 'formik';
import { forwardRef } from 'react';
import Select, { StylesConfig } from 'react-select';
import Async from 'react-select/async';
import Creatable from 'react-select/creatable';
import tw, { theme } from 'twin.macro';
import Label from '@/elements/Label';

type T = any;

export const SelectStyle: StylesConfig<T, any, any> = {
    clearIndicator: (base, props) => {
        return {
            ...base,
            color: props.isFocused ? theme`colors.neutral.300` : theme`colors.neutral.400`,

            ':hover': {
                color: theme`colors.neutral.100`,
            },
        };
    },

    container: base => {
        return {
            ...base,
        };
    },

    control: (base, props) => {
        return {
            ...base,
            height: '3rem',
            background: theme`colors.neutral.600`,
            borderColor: !props.isFocused ? theme`colors.neutral.500` : theme`colors.primary.300`,
            borderWidth: '2px',
            color: theme`colors.neutral.200`,
            cursor: 'pointer',
            boxShadow: props.isFocused
                ? 'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(36, 135, 235, 0.5) 0px 0px 0px 2px, rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px'
                : undefined,

            ':hover': {
                borderColor: !props.isFocused ? theme`colors.neutral.400` : theme`colors.primary.300`,
            },
        };
    },

    dropdownIndicator: (base, props) => {
        return {
            ...base,
            color: props.isFocused ? theme`colors.neutral.300` : theme`colors.neutral.400`,
            transform: props.isFocused ? 'rotate(180deg)' : undefined,

            ':hover': {
                color: theme`colors.neutral.300`,
            },
        };
    },

    group: base => {
        return {
            ...base,
        };
    },

    groupHeading: base => {
        return {
            ...base,
        };
    },

    indicatorsContainer: base => {
        return {
            ...base,
        };
    },

    indicatorSeparator: base => {
        return {
            ...base,
            backgroundColor: theme`colors.neutral.500`,
        };
    },

    input: base => {
        return {
            ...base,
            color: theme`colors.neutral.200`,
            fontSize: '0.875rem',
        };
    },

    loadingIndicator: base => {
        return {
            ...base,
        };
    },

    loadingMessage: base => {
        return {
            ...base,
        };
    },

    menu: base => {
        return {
            ...base,
            background: theme`colors.neutral.900`,
            color: theme`colors.neutral.200`,
        };
    },

    menuList: base => {
        return {
            ...base,
        };
    },

    menuPortal: base => {
        return {
            ...base,
        };
    },

    multiValue: base => {
        return {
            ...base,
            background: theme`colors.neutral.900`,
            color: theme`colors.neutral.200`,
        };
    },

    multiValueLabel: base => {
        return {
            ...base,
            color: theme`colors.neutral.200`,
        };
    },

    multiValueRemove: base => {
        return {
            ...base,
        };
    },

    noOptionsMessage: base => {
        return {
            ...base,
        };
    },

    option: base => {
        return {
            ...base,
            background: theme`colors.neutral.900`,

            ':hover': {
                background: theme`colors.neutral.700`,
                cursor: 'pointer',
            },
        };
    },

    placeholder: base => {
        return {
            ...base,
            color: theme`colors.neutral.300`,
            fontSize: '0.875rem',
        };
    },

    singleValue: base => {
        return {
            ...base,
            color: '#00000',
        };
    },

    valueContainer: base => {
        return {
            ...base,
        };
    },
};

export interface Option {
    value: string;
    label: string;
}

interface SelectFieldProps {
    id?: string;
    name: string;
    label?: string;
    description?: string;
    placeholder?: string;
    validate?: (value: any) => undefined | string | Promise<any>;

    options: Array<Option>;

    isMulti?: boolean;
    isSearchable?: boolean;

    isCreatable?: boolean;
    isValidNewOption?: ((inputValue: string, value: any, options: ReadonlyArray<any>) => boolean) | undefined;

    className?: string;
}

const SelectField = forwardRef<HTMLElement, SelectFieldProps>(function Select2(
    { id, name, label, description, validate, className, isMulti, isCreatable, ...props },
    ref,
) {
    const { options } = props;

    const onChange = (
        options: Option | Option[],
        name: string,
        setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void,
    ) => {
        if (isMulti) {
            setFieldValue(
                name,
                (options as Option[]).map(o => o.value),
            );
            return;
        }

        setFieldValue(name, (options as Option).value);
    };

    return (
        <FormikField innerRef={ref} name={name} validate={validate}>
            {({ field, form: { errors, touched, setFieldValue } }: FieldProps) => (
                <div className={className}>
                    {label && <Label htmlFor={id}>{label}</Label>}
                    {isCreatable ? (
                        <Creatable
                            {...field}
                            {...props}
                            styles={SelectStyle}
                            options={options}
                            value={(options ? options.find(o => o.value === field.value) : '') as any}
                            onChange={o => onChange(o, name, setFieldValue)}
                            isMulti={isMulti}
                        />
                    ) : (
                        <Select
                            {...field}
                            {...props}
                            styles={SelectStyle}
                            options={options}
                            value={(options ? options.find(o => o.value === field.value) : '') as any}
                            onChange={o => onChange(o, name, setFieldValue)}
                            isMulti={isMulti}
                        />
                    )}
                    {touched[field.name] && errors[field.name] ? (
                        <p css={tw`text-red-200 text-xs mt-1`}>
                            {(errors[field.name] as string).charAt(0).toUpperCase() +
                                (errors[field.name] as string).slice(1)}
                        </p>
                    ) : description ? (
                        <p css={tw`text-neutral-400 text-xs mt-1`}>{description}</p>
                    ) : null}
                </div>
            )}
        </FormikField>
    );
});

interface AsyncSelectFieldProps {
    id?: string;
    name: string;
    label?: string;
    description?: string;
    placeholder?: string;
    validate?: (value: any) => undefined | string | Promise<any>;

    isMulti?: boolean;

    className?: string;

    loadOptions(inputValue: string, callback: (options: Array<Option>) => void): void;
}

const AsyncSelectField = forwardRef<HTMLElement, AsyncSelectFieldProps>(function AsyncSelect2(
    { id, name, label, description, validate, className, isMulti, ...props },
    ref,
) {
    const onChange = (
        options: Option | Option[],
        name: string,
        setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void,
    ) => {
        if (isMulti) {
            setFieldValue(
                name,
                (options as Option[]).map(o => Number(o.value)),
            );
            return;
        }

        setFieldValue(name, Number((options as Option).value));
    };

    return (
        <FormikField innerRef={ref} name={name} validate={validate}>
            {({ field, form: { errors, touched, setFieldValue } }: FieldProps) => (
                <div className={className}>
                    {label && <Label htmlFor={id}>{label}</Label>}
                    <Async
                        {...props}
                        id={id}
                        name={name}
                        styles={SelectStyle}
                        onChange={o => onChange(o, name, setFieldValue)}
                        isMulti={isMulti}
                    />
                    {touched[field.name] && errors[field.name] ? (
                        <p css={tw`text-red-200 text-xs mt-1`}>
                            {(errors[field.name] as string).charAt(0).toUpperCase() +
                                (errors[field.name] as string).slice(1)}
                        </p>
                    ) : description ? (
                        <p css={tw`text-neutral-400 text-xs mt-1`}>{description}</p>
                    ) : null}
                </div>
            )}
        </FormikField>
    );
});

export default SelectField;
export { AsyncSelectField };
