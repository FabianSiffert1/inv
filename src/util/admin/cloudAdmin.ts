import { doc, onSnapshot } from 'firebase/firestore'
import { firestore } from '../firebase/app'

export const subscribeToAdminRole = (uid: string, onChange: (isAdmin: boolean) => void) =>
  onSnapshot(
    doc(firestore, 'roles', uid),
    (snapshot) => onChange(snapshot.exists() && snapshot.data().admin == true),
    () => onChange(false)
  )
