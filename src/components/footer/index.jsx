import React, { useState } from "react";
import {
  Container,
  Group,
  Image,
  Button,
  Text,
  Grid,
  Stack,
  Anchor,
  Box,
  Flex,
  Skeleton,
} from "@mantine/core";
import { useStaticQuery } from "../../Libs/reactQuery";
import ImageIcon from '../../resources/defaultImageIcon';


const Footer = () => {

  const [logoError, setLogoError] = useState(false);
  const [socialIconErrors, setSocialIconErrors] = useState({});
  const isValidLogo = (logo) => {
    if (!logo) return false;
    if (Array.isArray(logo) && (logo.length === 0 || logo[0] === "")) return false;
    if (typeof logo === 'string' && logo.trim() === "") return false;
    return true;
  };

  // Bootstrap data via React Query (static strategy with persistence)
  // Keep same shape as old Redux: { message, data: {...} }
  const { data: bootstrap, loading: loadingBootstrap } = useStaticQuery({
    endpoint: '/bootstrap',
    queryKey: ['bootstrap'],
    transformer: (response) => response?.data ?? null,
  });




  const handleSocialIconError = (itemId) => {
  setSocialIconErrors(prev => ({ ...prev, [itemId]: true }));
};



  return (
    <Box className="border-t pt-10 bg-white z-30" id="footer">
      <Box
        px={{ base: 'xs', sm: 'md' }}
        style={{
          width: '100%',
          maxWidth: '1336px',
          margin: '0 auto'
        }}
      >
        {/* Header with Logo and Scroll Button */}
        <Group justify="space-between" w="100%">
          <Stack gap="xs">
            {loadingBootstrap ? (
              <Skeleton w={150} h={48} />
            ) : isValidLogo(bootstrap?.data.logo) && !logoError ? (
              <Image 
                className="w-32 md:w-48" 
                src={bootstrap?.data.logo} 
                alt={bootstrap?.data.siteTitle || "Logo"}
                onError={() => setLogoError(true)}
              />
            ) : (
              <ImageIcon 
                size={window.innerWidth < 768 ? 128 : 192} 
                color="#6B7280" 
              />
            )}
          </Stack>
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            variant="outline"
            styles={{
              root: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                padding: '0.25rem 1.0rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#f9fafb'
                }
              }
            }}
          >
            <Flex gap={6}>

              <Flex>
                <Text c="#9ca3af" size="sm" fw={400}>
                  { "بازگشت به بالا"}
                </Text>
              </Flex>
              <Flex>

              <svg
                width="24"
                height="18"
                fill="none"
                stroke="#9ca3af"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                >
                <path d="m18 15-6-6-6 6"/>
              </svg>
              </Flex>
            </Flex>
          </Button>
        </Group>

        {/* Features Section */}
        {bootstrap?.data.footer?.features && bootstrap.data.footer.features.length > 0 && (
          <Grid gutter="md" mt={40} mb={40}>
            {bootstrap.data.footer.features.map((feature, index) => (
              <Grid.Col key={index} span={{ base: 6, xs: 4, sm: 2.4 }}>
                <Stack align="center" gap="xs">
                  <Image 
                    src={feature.icon} 
                    alt={feature.label}
                    w={48}
                    h={48}
                    fit="contain"
                  />
                  <Text size="sm" ta="center">{feature.label}</Text>
                </Stack>
              </Grid.Col>
            ))}
          </Grid>
        )}

        {/* Footer Menu Categories with Certificates Column */}
        <Grid gutter="xl" mt={50} mb={60} align="start">
          {/* Left Column - Footer Menu */}
          <Grid.Col span={{ base: 12, md: 9 }}>
            <Grid gutter="xl">
              {bootstrap?.data.footer?.menuLinks?.map((item) => (
                <Grid.Col key={item.id} span={{ base: 6, sm: 4, lg: 3 }}>
                  <Stack>
                    {item.links?.map((link) => (
                      <Anchor
                        key={link.id}
                        href={link.url}
                        underline="never"
                        size="sm"
                        c="dark"
                      >
                        {link.label}
                      </Anchor>
                    ))}
                  </Stack>
                </Grid.Col>
              ))}
            </Grid>
          </Grid.Col>

          {/* Right Column - Certificates/Trust Images (VERTICAL) */}
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Flex direction="row" gap="md">
              {bootstrap?.data.footer?.certificates?.map((cert, index) => (
                <Anchor
                  key={index}
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Box
                    style={{
                      width: '108px',
                      height: '108px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Image
                      src={cert.image}
                      alt={cert.alt || `Certificate ${index + 1}`}
                      w={75}
                      h={75}
                      // style={{
                      //   width: '75px',
                      //   height: '75px',
                      //   // maxWidth: '75px',
                      //   // maxHeight: '75px',
                      //   objectFit: 'cover'
                      // }}
                    />
                  </Box>
                </Anchor>
              ))}
            </Flex>
          </Grid.Col>
        </Grid>

        {/* Bottom Bar with Copyright and Social Links */}
        <Group justify="space-between" pb={{ base: 100, md: "xl" }}>
          <Group gap="xl">
            {bootstrap?.data.footer?.contactPhone && (
              <Text size="xs" c="gray" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <i className="bi bi-telephone" style={{ fontSize: 16 }}></i>
                {bootstrap.data.footer.contactPhone}
              </Text>
            )}
            <Text size="xs" c="gray">
              {bootstrap?.data.footer?.copyrightText || "تمامی حقوق برای این فروشگاه محفوظ است"}
            </Text>
          </Group>
          
{/* Social Links */}
<Group gap="md">
  {(() => {
    console.log('=== SOCIAL LINKS DEBUG ===');
    console.log('bootstrap?.data.menu?.social:', bootstrap?.data.menu?.social);
    console.log('social[0]:', bootstrap?.data.menu?.social?.[0]);
    console.log('links:', bootstrap?.data.menu?.social?.[0]?.links);
    
    const links = bootstrap?.data.menu?.social?.[0]?.links;
    if (links) {
      links.forEach((item, index) => {
        console.log(`Link ${index}:`, {
          id: item.id,
          label: item.label,
          icon: item.icon,
          iconType: item.icon?.startsWith("bi ") ? 'bootstrap' : 
                    item.icon?.startsWith("/") ? 'image' : 
                    item.icon ? 'other-class' : 'none',
          url: item.url
        });
      });
    }
    return null;
  })()}
  
  {bootstrap?.data.menu?.social?.[0]?.links?.map((item) => (
    <Anchor
      key={item.id}
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      c="dark.6"
      style={{ 
        display: "flex", 
        alignItems: "center",
        transition: "color 0.2s ease"
      }}
      className="hover:text-blue-600"
    >
      {/* Detect if icon is Bootstrap Icon class (bi bi-*) or image URL */}
      {item.icon?.startsWith("bi ") ? (
        <i 
          className={item.icon} 
          style={{ fontSize: 18 }}
          aria-label={item.label}
        ></i>
      ) : item.icon?.startsWith("/") && !socialIconErrors[item.id] ? (
        <Image 
          src={item.icon} 
          w={24} 
          h={24} 
          fit="contain"
          alt={item.label}
          onError={() => handleSocialIconError(item.id)}
        />
      ) : item.icon && !item.icon.startsWith("bi ") && !item.icon.startsWith("/") ? (
        <i 
          className={item.icon} 
          style={{ fontSize: 24 }}
          aria-label={item.label}
        ></i>
      ) : (
        <ImageIcon size={24} color="#6B7280" />
      )}
    </Anchor>
  ))}
</Group>
        </Group>
      </Box>
    </Box>
  );
};

export default Footer;