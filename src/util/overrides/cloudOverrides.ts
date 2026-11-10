import { deleteField, doc, FieldPath, setDoc, updateDoc } from 'firebase/firestore'
import { firestore } from '../firebase/app'

const overridesDocument = () => doc(firestore, 'config', 'cardOverrides')

export const setImageOverride = (cardId: string, url: string) => setDoc(overridesDocument(), { images: { [cardId]: url } }, { merge: true })

export const removeImageOverride = (cardId: string) => updateDoc(overridesDocument(), new FieldPath('images', cardId), deleteField())
