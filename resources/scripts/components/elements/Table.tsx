import { useStoreState } from '@/state/hooks';
import { ReactNode } from 'react';

const Header = ({ children }: { children: ReactNode }) => {
    const { colors } = useStoreState(s => s.theme.data!);

    return (
        <thead className={'text-xs uppercase text-gray-400'} style={{ backgroundColor: colors.headers }}>
            <tr>{children}</tr>
        </thead>
    );
};

const HeaderItem = ({ children }: { children: ReactNode }) => <th className={'px-6 py-3'}>{children}</th>;

const Body = ({ children }: { children: ReactNode }) => <tbody>{children}</tbody>;

const BodyItem = ({ item, children }: { item: string; children: ReactNode }) => {
    const { colors } = useStoreState(s => s.theme.data!);

    return (
        <tr className={'border-b-2 border-gray-700'} style={{ backgroundColor: colors.secondary }}>
            <th
                style={{ color: colors.primary }}
                className={'px-6 py-4 font-bold whitespace-nowrap hover:brightness-150 duration-300'}
            >
                {item}
            </th>
            {children}
        </tr>
    );
};

const Table = ({ children }: { children: ReactNode[] }) => {
    return (
        <div className={'relative overflow-x-auto'}>
            <table className={'w-full text-sm text-left text-gray-400'}>{children}</table>
        </div>
    );
};

export { Table, Header, HeaderItem, Body, BodyItem };
