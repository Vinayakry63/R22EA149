import React, { useState } from "react";
import { Container, TextField, Button, Typography, Stack, Box } from "@mui/material";

const URLShortenerPage = () => {
    const [urls, setUrls] = useState([
        { url: "", validity: "", shortcode: "", result: null },
    ]);

    const handleChange = (index, field, value) => {
        const newUrls = [...urls];
        newUrls[index][field] = value;
        setUrls(newUrls);
    };

    const addUrl = () => {
        if (urls.length < 5) setUrls([...urls, { url: "", validity: "", shortcode: "", result: null }]);
    };

    const handleSubmit = async () => {
        const newUrls = [...urls];
        for (let i = 0; i < newUrls.length; i++) {
            const u = newUrls[i];
            if (!u.url) continue;

            // Basic client validation
            if (!/^https?:\/\/.+/.test(u.url)) {
                alert(`URL ${i + 1} is invalid`);
                continue;
            }
            if (u.validity && (!Number.isInteger(Number(u.validity)) || Number(u.validity) <= 0)) {
                alert(`Validity for URL ${i + 1} should be a positive integer`);
                continue;
            }

            // Call backend API
            try {
                const response = await fetch("http://localhost:3001/shorturls", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        url: u.url,
                        validity: u.validity ? parseInt(u.validity) : undefined,
                        shortcode: u.shortcode || undefined,
                    }),
                });
                const data = await response.json();
                if (response.status === 201) {
                    newUrls[i].result = data.shortLink + " (expires: " + data.expiry + ")";
                } else {
                    newUrls[i].result = "Error: " + (data.error || "Unknown error");
                }
            } catch (err) {
                newUrls[i].result = "Network error";
            }
        }
        setUrls(newUrls);
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>URL Shortener</Typography>
            {urls.map((item, idx) => (
                <Box key={idx} sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
                    <Stack spacing={2}>
                        <TextField
                            label="Original URL"
                            value={item.url}
                            onChange={(e) => handleChange(idx, "url", e.target.value)}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Validity (minutes, optional)"
                            value={item.validity}
                            onChange={(e) => handleChange(idx, "validity", e.target.value)}
                            type="number"
                            fullWidth
                        />
                        <TextField
                            label="Preferred Shortcode (optional)"
                            value={item.shortcode}
                            onChange={(e) => handleChange(idx, "shortcode", e.target.value)}
                            fullWidth
                        />
                        {item.result && (
                            <Typography variant="body2" color={item.result.startsWith("Error") ? "error" : "primary"}>
                                {item.result}
                            </Typography>
                        )}
                    </Stack>
                </Box>
            ))}
            <Button variant="outlined" onClick={addUrl} disabled={urls.length >= 5} sx={{ mr: 2 }}>
                Add URL
            </Button>
            <Button variant="contained" onClick={handleSubmit}>
                Shorten URLs
            </Button>
        </Container>
    );
};

export default URLShortenerPage;
