import { Avatar, Box, Container, Stack, Typography } from "@mui/material";

export default function Header() {
  return (
    <Box component="header" sx={{ borderBottom: 1, borderColor: "divider" }}>
      <Container maxWidth="lg">
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 80,
          }}
        >
          <Typography
            component="h1"
            sx={{ fontSize: 28, fontWeight: 800, color: "primary.main" }}
          >
            JALÓN
            <Box component="span" sx={{ color: "secondary.main" }}>
              .
            </Box>
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              David
            </Typography>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "primary.light",
                color: "primary.dark",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              DA
            </Avatar>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
