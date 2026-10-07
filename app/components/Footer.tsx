import { Box, Container, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: "divider",
        py: 3,
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="caption" color="text.secondary">
          © 2026 JALÓN. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  );
}
