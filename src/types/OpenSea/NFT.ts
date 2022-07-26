import { default as GeneralNFT } from '../NFT'

export default interface OpenSeaNFT {
   image_url?: string
   image_preview_url?: string
   image_thumbnail_url?: string
   image_original_url?: string
   animation_url?: string
   animation_original_url?: string

   name?: string
   description?: string
   asset_contract?: {
      address?: string
      created_date?: string
   }
   collection?: {
      stats?: {
         one_day_volume?: number
         one_day_change?: number
         one_day_sales?: number
         one_day_average_price?: number
         seven_day_volume?: number
         seven_day_change?: number
         seven_day_sales?: number
         seven_day_average_price?: number
         thirty_day_volume?: number
         thirty_day_change?: number
         thirty_day_sales?: number
         thirty_day_average_price?: number
         total_volume?: number
         total_sales?: number
         total_supply?: number
         count?: number
         num_owners?: number
         average_price?: number
         num_reports?: number
         market_cap?: number
         floor_price?: number
      }
      banner_image_url?: string
      chat_url?: string
      created_date?: string
      discord_url?: string
      external_url?: string
      safelist_request_status?: string
      image_url?: string
      is_subject_to_whitelist?: false
      large_image_url?: string
      medium_username?: string
      name?: string
      only_proxied_transfers?: false
      slug?: string
      telegram_url?: string
      twitter_username?: string
      instagram_username?: string
   }
   traits?: Array<{
      trait_type: string
      value: string
   }>
   token_id: string
}

export function openseaToGeneralNFTType(data: OpenSeaNFT) : GeneralNFT {
   return {
     name: data?.name,
     image: data?.image_url,
     description: data?.description,
     token_id: data?.token_id,
     attributes: data?.traits,
     collection: {
      name: data?.collection?.name,
      image: data?.collection?.image_url,
      contract_address: data?.asset_contract?.address
     }
   }
 }