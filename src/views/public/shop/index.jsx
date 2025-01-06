import React from 'react'
import Archive from "../../../components/archive";

function Shop() {
  const url = '/shop';
  return (
    <Archive url={url} enabled={true} />
  )
}

export default Shop