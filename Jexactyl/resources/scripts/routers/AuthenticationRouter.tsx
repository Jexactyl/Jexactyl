import { Route, Routes, useNavigate } from 'react-router-dom';
import LoginContainer from '@/components/auth/LoginContainer';
import ForgotPasswordContainer from '@/components/auth/ForgotPasswordContainer';
import ResetPasswordContainer from '@/components/auth/ResetPasswordContainer';
import LoginCheckpointContainer from '@/components/auth/LoginCheckpointContainer';
import { NotFound } from '@/elements/ScreenBlock';
import tw, { styled } from 'twin.macro';
import { useStoreState } from '@/state/hooks';
import RegisterContainer from '@/components/auth/RegisterContainer';

const Container = styled.div`
    ${tw`h-screen bg-login bg-cover`};
    background-repeat: no-repeat;
    background-blend-mode: darken;
`;

export default () => {
    const navigate = useNavigate();
    const registration = useStoreState(state => state.everest.data!.auth.registration.enabled);

    return (
        <Container>
            <div className="pt-8 xl:pt-32">
                <Routes>
                    <Route path="login" element={<LoginContainer />} />
                    <Route path="login/checkpoint/*" element={<LoginCheckpointContainer />} />
                    {registration && <Route path={'register'} element={<RegisterContainer />} />}
                    <Route path="password" element={<ForgotPasswordContainer />} />
                    <Route path="password/reset/:token" element={<ResetPasswordContainer />} />
                    <Route path="*" element={<NotFound onBack={() => navigate('/auth/login')} />} />
                </Routes>
            </div>
        </Container>
    );
};
