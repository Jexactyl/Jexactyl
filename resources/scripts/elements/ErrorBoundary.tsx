import type { ReactNode } from 'react';
import { Component } from 'react';
import tw from 'twin.macro';
import { ExclamationIcon } from '@heroicons/react/outline';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    override state: State = {
        hasError: false,
    };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    override componentDidCatch(error: Error) {
        console.error(error);
    }

    override render() {
        return this.state.hasError ? (
            <div css={tw`flex items-center justify-center w-full my-4`}>
                <div
                    css={tw`flex items-center bg-neutral-900/90 backdrop-blur-sm rounded-xl shadow-lg ring-1 ring-red-500/20 p-3 text-red-500`}
                >
                    <ExclamationIcon css={tw`h-4 w-4 flex-shrink-0 mr-2`} />

                    <p css={tw`text-sm text-neutral-100`}>
                        An error was encountered by the application while rendering this view. Try refreshing the page.
                    </p>
                </div>
            </div>
        ) : (
            this.props.children
        );
    }
}

export default ErrorBoundary;
