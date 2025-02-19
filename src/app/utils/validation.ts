export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  export const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return phoneRegex.test(phone)
  }
  
  export const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
  
  export const validateDates = (startDate: string, endDate: string): boolean => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return start <= end
  }
  
  