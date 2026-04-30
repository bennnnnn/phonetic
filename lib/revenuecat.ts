import Purchases, { PurchasesOffering, CustomerInfo } from 'react-native-purchases'
import { Platform } from 'react-native'

const API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? ''
const API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? ''

/**
 * Initialise RevenueCat with the correct API key for the platform.
 * Call this once in the root layout.
 */
export async function initRevenueCat() {
  const apiKey = Platform.OS === 'ios' ? API_KEY_IOS : API_KEY_ANDROID
  if (!apiKey) {
    console.warn('[RevenueCat] No API key configured — subscriptions disabled')
    return
  }
  try {
    await Purchases.configure({ apiKey })
  } catch (err) {
    console.warn('[RevenueCat] Init failed', err)
  }
}

/**
 * Fetch the current offering (product list from RevenueCat dashboard).
 * Returns null if not configured or fails.
 */
export async function getProOffering(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings()
    return offerings.current ?? null
  } catch {
    return null
  }
}

/**
 * Purchase the current Pro offering (monthly or yearly, whichever is configured).
 */
export async function purchasePro(): Promise<boolean> {
  try {
    const offering = await getProOffering()
    if (!offering?.availablePackages?.length) return false
    const { customerInfo } = await Purchases.purchasePackage(offering.availablePackages[0]!)
    return checkProEntitlement(customerInfo)
  } catch {
    return false
  }
}

/**
 * Restore previous purchases.
 */
export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases()
    return checkProEntitlement(customerInfo)
  } catch {
    return false
  }
}

/**
 * Check if the current user has the "pro" entitlement active.
 */
function checkProEntitlement(customerInfo: CustomerInfo): boolean {
  const pro = customerInfo.entitlements.active['pro']
  return pro !== undefined && pro !== null
}

/**
 * Returns whether the user currently has an active RevenueCat Pro entitlement.
 */
export async function hasProEntitlement(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.getCustomerInfo()
    return checkProEntitlement(customerInfo)
  } catch {
    return false
  }
}
