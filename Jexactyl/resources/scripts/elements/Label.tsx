import styled from 'styled-components';
import tw from 'twin.macro';

const Label = styled.label<{ isLight?: boolean }>`
    ${tw`block text-sm font-semibold text-neutral-300 mb-1 sm:mb-2`};
    ${props => props.isLight && tw`text-neutral-700`};
`;

export default Label;
