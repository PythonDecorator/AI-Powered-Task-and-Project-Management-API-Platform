import Stack from '@mui/material/Stack';
import SignInCard from './components/SignInCard';
import Content from './components/Content';

export default function SignInSide() {
  return (
    <Stack
      direction={{ xs: 'column-reverse', md: 'row' }}
      sx={{
        justifyContent: 'center',
        gap: { xs: 6, sm: 12 },
        p: 2,
        mx: 'auto',
      }}
    >
      <Stack
        direction={{ xs: 'column-reverse', md: 'row' }}
        sx={{
          justifyContent: 'center',
          gap: { xs: 6, sm: 12 },
          p: { xs: 2, sm: 4 },
          m: 'auto',
        }}
      >
        <Content />
        <SignInCard />
      </Stack>
    </Stack>
  );
}
