// Nouvelle fonction onSubmit optimisée
const onSubmit = async (data: CreateCapsuleForm) => {
  if (!selectedFile) {
    toast.error('Veuillez sélectionner un fichier')
    return
  }
  
  setIsCreating(true)
  
  try {
    // Utiliser la logique de production optimisée
    const result = await createCapsuleProduction({
      data,
      selectedFile,
      userAddress: user?.address
    })
    
    if (result.success) {
      const statusInfo = getSystemStatus()
      
      if (result.isLocal) {
        toast.success('Capsule créée en mode développement !')
        console.log('Capsule créée localement:', result.capsuleId)
      } else {
        toast.success(`Capsule créée sur blockchain! TX: ${result.txHash?.slice(0, 8)}...`)
        console.log('Capsule créée sur blockchain:', {
          id: result.capsuleId,
          tx: result.txHash
        })
      }
      
      // Rediriger vers le dashboard
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      
    } else {
      throw new Error(result.error || 'Erreur inconnue')
    }
    
  } catch (error: any) {
    console.error('Erreur lors de la création:', error)
    toast.error(error.message || 'Erreur lors de la création de la capsule')
  } finally {
    setIsCreating(false)
  }
}