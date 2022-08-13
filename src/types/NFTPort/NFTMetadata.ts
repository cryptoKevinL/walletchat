// NFT Port API

export interface NFTMetadataOpenSeaType {
   name: string
   token_id: string
   description: string
}

export default interface NFTMetadataType {
   contract: {
      metadata: {
         banner_url: string
         cached_banner_url: string
         cached_thumbnail_url: string
         description: string
         thumbnail_url: string
      }
      name: string
      symbol: string
      type: string
   }
   nft?: NFTType,
   nfts?: Array<NFTType>
   owner: string
}

interface NFTType {
   name: string
      animation_url?: string | null
      cached_animation_url?: string | null
      cached_file_url?: string | null
      chain?: string
      contract_address?: string
      file_url?: string | null
      metadata?: {
         attributes: Array<{
            trait_type: string
            value: string
         }>
         description: string
         google_image: string
         image: string
         ipfs_image: string
         name: string
      }
      metadata_url?: string
      mint_date?: string
      token_id?: string
      updated_date?: string
}