import type { FieldProps } from 'formik';
import { Field as FormikField } from 'formik';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';
import tw, { styled } from 'twin.macro';

import Label from '@/elements/Label';
import Input, { Textarea } from '@/elements/Input';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import InputError from './InputError';
import { useStoreState } from '@/state/hooks';

interface OwnProps {
    name: string;
    light?: boolean;
    label?: string;
    description?: string;
    validate?: (value: any) => undefined | string | Promise<any>;
    icon?: IconDefinition;
}

type Props = OwnProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'name'>;

const InputWrapper = styled.div<{ $bgColor: string }>`
    ${tw`flex items-center rounded-md border-2 border-zinc-800`};
    background-color: ${({ $bgColor }) => $bgColor};
`;

const IconWrapper = styled.div<{ $bgColor: string }>`
    ${tw`pl-3 text-gray-400 flex-shrink-0`};
    background-color: ${({ $bgColor }) => $bgColor};
`;

const StyledInput = styled(Input)`
    ${tw`flex-grow py-2 px-3 focus:outline-none text-white`};
    border: none;
    box-shadow: none;
`;

const Field = forwardRef<HTMLInputElement, Props>(
    ({ id, name, light = false, label, description, validate, icon, type = 'text', ...props }, ref) => {
        const theme = useStoreState(state => state.theme.data!);
        const bgColor = theme.colors.secondary;

        return (
            <FormikField name={name} validate={validate}>
                {({ field, form: { errors, touched } }: FieldProps) => {
                    const error = touched[field.name] && errors[field.name];

                    // ✅ Checkbox logic fix without breaking design
                    if (type === 'checkbox') {
                        return (
                            <div>
                                {label && (
                                    <Label htmlFor={id} isLight={light}>
                                        {label}
                                    </Label>
                                )}
                                <Input
                                    {...props}
                                    id={id}
                                    type="checkbox"
                                    isLight={light}
                                    checked={!!field.value}
                                    onChange={e =>
                                        field.onChange({
                                            target: { name: field.name, value: e.target.checked },
                                        })
                                    }
                                    onBlur={field.onBlur}
                                    ref={ref}
                                />
                                {error ? (
                                    <p className="input-help error text-red-400 text-xs mt-1">
                                        {(errors[field.name] as string).charAt(0).toUpperCase() +
                                            (errors[field.name] as string).slice(1)}
                                    </p>
                                ) : description ? (
                                    <p className="input-help">{description}</p>
                                ) : null}
                            </div>
                        );
                    }

                    return (
                        <div>
                            {label && (
                                <Label htmlFor={id} isLight={light}>
                                    {label}
                                </Label>
                            )}

                            {icon ? (
                                <InputWrapper $bgColor={bgColor}>
                                    <IconWrapper $bgColor={bgColor}>
                                        <FontAwesomeIcon icon={icon} />
                                    </IconWrapper>
                                    <StyledInput id={id} {...field} {...props} isLight={light} />
                                </InputWrapper>
                            ) : (
                                <Input id={id} {...field} {...props} isLight={light} />
                            )}

                            {error ? (
                                <p className="input-help error text-red-400 text-xs mt-1">
                                    {(errors[field.name] as string).charAt(0).toUpperCase() +
                                        (errors[field.name] as string).slice(1)}
                                </p>
                            ) : description ? (
                                <p className="input-help">{description}</p>
                            ) : null}
                        </div>
                    );
                }}
            </FormikField>
        );
    },
);

Field.displayName = 'Field';
export default Field;

type TextareaProps = OwnProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'>;

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaProps>(function TextareaField(
    { id, name, light = false, label, description, validate, className, ...props },
    ref,
) {
    return (
        <FormikField innerRef={ref} name={name} validate={validate}>
            {({ field, form: { errors, touched } }: FieldProps) => (
                <div className={className}>
                    {label && (
                        <Label htmlFor={id} isLight={light}>
                            {label}
                        </Label>
                    )}
                    <Textarea id={id} {...field} {...props} isLight={light} />
                    <InputError errors={errors} touched={touched} name={field.name}>
                        {description || null}
                    </InputError>
                </div>
            )}
        </FormikField>
    );
});
TextareaField.displayName = 'TextareaField';

export const FieldRow = styled.div`
    ${tw`grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 mb-6`};
    & > div {
        ${tw`sm:w-full sm:flex sm:flex-col`};
    }
`;
