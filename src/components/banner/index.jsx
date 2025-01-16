import { Anchor } from '@mantine/core'
import React from 'react'
import { NavLink } from 'react-router'

function Banner({image,url}) {
  return (
    <Anchor
    h="auto"
    underline="never"
    component={NavLink}
    to={url}
    className='rounded-xl'
  >
    <picture className='rounded-xl'>
      {/* JPEG/PNG برای دستگاه‌های موبایل */}
      <source
        media="(max-width: 600px)"
        srcSet={`${image.mobileImage} 480w`}
      />
      {/* JPEG/PNG برای دستگاه‌های تبلت */}
      <source
        media="(max-width: 900px)"
        srcSet={`${image.tabletImage} 800w`}
      />
      {/* JPEG/PNG برای دستگاه‌های دسکتاپ */}
      <source
        media="(min-width: 901px)"
        srcSet={`${image.desktopImage} 1200w`}
      />
      {/* تصویر پیش‌فرض (JPEG/PNG) */}
      <img
        src={image.mobileImage}
        alt={`Image`}
        style={{ width: "100%", height: "auto" }}
        className='rounded-xl'
      />
    </picture>
  </Anchor>
  )
}

export default Banner