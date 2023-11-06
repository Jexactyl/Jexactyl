import tw from 'twin.macro';
import styled from 'styled-components/macro';

const Label = styled.label<{ isLight?: boolean }>`
    ${tw`block text-sm font-medium text-neutral-200 font-semibold mb-1 sm:mb-2`};
    ${(props) => props.isLight && tw`text-gray-400`};
`;

export default Label;
