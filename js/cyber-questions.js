// ============================================================================
// 15. DOMANDE DI CYBERSECURITY (LIVELLO TERZA MEDIA)
// La prima risposta di ogni domanda è quella giusta: l'ordine viene mescolato a video.
// ============================================================================
const CYBER_QUESTIONS = [
  {
    q: 'Quale di queste password è la più sicura?',
    answers: ['Luna!Treno7#Zaino', 'Gatto2009', '123456', 'password'],
    why: 'Lunga, con parole senza senso, numeri e simboli: difficilissima da indovinare.'
  },
  {
    q: 'Ti arriva un messaggio: "Hai vinto un iPhone! Clicca qui per ritirarlo". Cosa fai?',
    answers: ['Non clicco e lo cancello', 'Clicco subito prima che scada', 'Lo inoltro a tutti i miei amici', 'Inserisco i miei dati per il premio'],
    why: 'Premi a sorpresa che chiedono di cliccare sono quasi sempre truffe.'
  },
  {
    q: 'Che cos\'è il phishing?',
    answers: ['Una truffa che si finge qualcun altro per rubarti password e dati', 'La pesca sportiva in versione online', 'Un antivirus gratuito', 'Un videogioco famoso'],
    why: 'Il truffatore "pesca" le tue informazioni con messaggi o siti falsi.'
  },
  {
    q: 'A chi puoi dire la password del tuo account?',
    answers: ['A nessuno, al massimo ai miei genitori', 'Al mio migliore amico', 'A chi me la chiede in chat', 'Al "tecnico" che mi scrive su Instagram'],
    why: 'Anche gli amici possono litigare o sbagliare. E i veri tecnici non chiedono mai la password.'
  },
  {
    q: 'Vicino all\'indirizzo di un sito vedi un lucchetto. Cosa significa?',
    answers: ['La connessione è protetta, ma il sito potrebbe comunque essere falso', 'Il sito è sicuramente affidabile', 'Il sito è chiuso', 'Il sito è a pagamento'],
    why: 'Il lucchetto protegge solo il "tubo" dei dati: anche i siti truffa possono averlo!'
  },
  {
    q: 'A cosa serve l\'autenticazione a due fattori (2FA)?',
    answers: ['Aggiunge un secondo controllo, come un codice sul telefono', 'Ad avere due password uguali', 'A entrare due volte più velocemente', 'A usare due account insieme'],
    why: 'Anche se rubano la password, senza il secondo codice non entrano.'
  },
  {
    q: 'Sei connesso al Wi-Fi gratis di un bar. Cosa è meglio NON fare?',
    answers: ['Inserire password importanti o entrare nel conto in banca', 'Leggere le notizie', 'Guardare il meteo', 'Niente, il Wi-Fi pubblico è sempre sicuro'],
    why: 'Sulle reti pubbliche qualcuno potrebbe spiare quello che invii.'
  },
  {
    q: 'Un amico ti scrive da un numero nuovo: "Mandami il codice che ti è appena arrivato via SMS". Cosa fai?',
    answers: ['Non lo mando e lo chiamo sul numero vecchio per verificare', 'Glielo mando subito, è un amico', 'Gli mando anche la mia password', 'Lo pubblico nel gruppo della classe'],
    why: 'Quel codice serve a rubarti l\'account: è una delle truffe più diffuse su WhatsApp.'
  },
  {
    q: 'Che cos\'è un malware?',
    answers: ['Un programma creato per danneggiare o spiare un dispositivo', 'Un tipo di computer', 'Un social network', 'Una marca di cuffie'],
    why: 'Virus, trojan e spyware sono tutti tipi di malware.'
  },
  {
    q: 'Trovi una chiavetta USB per terra a scuola. Cosa fai?',
    answers: ['La consegno a un professore senza collegarla', 'La collego al PC per vedere di chi è', 'La collego al PC di classe', 'La tengo e la uso'],
    why: 'Una chiavetta sconosciuta può contenere un malware che parte appena la colleghi.'
  },
  {
    q: 'Quale di queste informazioni NON dovresti pubblicare sui social?',
    answers: ['Il tuo indirizzo di casa', 'Il tuo cibo preferito', 'La foto di un tramonto', 'Il tuo colore preferito'],
    why: 'Indirizzo, scuola e orari permettono a uno sconosciuto di trovarti.'
  },
  {
    q: 'Quando conviene installare gli aggiornamenti di app e telefono?',
    answers: ['Appena sono disponibili', 'Mai, potrebbero rompere tutto', 'Una volta ogni dieci anni', 'Solo se il telefono è nuovo'],
    why: 'Gli aggiornamenti chiudono le "porte" che gli hacker usano per entrare.'
  },
  {
    q: 'Usare la stessa password per tutti gli account è...',
    answers: ['Pericoloso: se ne scoprono una, entrano ovunque', 'Furbo, così non la dimentichi', 'Obbligatorio per legge', 'Più sicuro'],
    why: 'Ogni account dovrebbe avere la sua password diversa.'
  },
  {
    q: 'Ti arriva un link a "www.amaz0n-offerte.com". Cosa noti?',
    answers: ['Probabilmente è falso: c\'è uno zero al posto della "o"', 'È il sito ufficiale di Amazon', 'È un sito del governo', 'Nulla di strano'],
    why: 'I truffatori usano indirizzi quasi uguali a quelli veri: leggi sempre con attenzione.'
  },
  {
    q: 'Cosa fa un antivirus?',
    answers: ['Cerca e blocca i programmi dannosi', 'Rende internet più veloce', 'Protegge dal raffreddore', 'Ricarica la batteria'],
    why: 'Un antivirus aggiornato è una difesa importante, ma serve anche la tua attenzione.'
  },
  {
    q: 'In un gioco online uno sconosciuto ti regala monete se gli dai le credenziali. Cosa fai?',
    answers: ['Rifiuto: vuole rubarmi l\'account', 'Accetto, le monete gratis sono rare', 'Gli do solo la password', 'Gli do solo l\'email'],
    why: 'Nessuno regala niente in cambio delle tue credenziali.'
  },
  {
    q: 'Vedi che un compagno viene preso in giro in un gruppo online. Cosa fai?',
    answers: ['Lo dico a un adulto di fiducia e non condivido i messaggi', 'Metto like ai messaggi', 'Inoltro i messaggi ad altri', 'Faccio finta di niente'],
    why: 'Il cyberbullismo si ferma parlandone, non condividendo.'
  },
  {
    q: 'Ti arriva una email che sembra spedita dal TUO stesso indirizzo. Allora è sicura?',
    answers: ['No, il mittente di una email si può falsificare', 'Sì, l\'ho mandata io', 'Sì, le email non mentono mai', 'Sì, se contiene un link'],
    why: 'I truffatori possono scrivere qualsiasi mittente: non fidarti solo del nome.'
  },
  {
    q: 'La modalità "in incognito" del browser ti rende invisibile su internet?',
    answers: ['No, nasconde la cronologia solo sul tuo dispositivo', 'Sì, nessuno può vedermi', 'Sì, cambia la mia faccia in webcam', 'Sì, blocca tutti i virus'],
    why: 'Siti, scuola o operatore possono comunque vedere cosa visiti.'
  },
  {
    q: 'Perché alcune persone coprono la webcam del computer?',
    answers: ['Perché un malware potrebbe accenderla di nascosto', 'Per non sporcarla', 'Per farla durare di più', 'Perché la luce la rompe'],
    why: 'Esistono programmi spia che accendono la webcam senza che te ne accorgi.'
  },
  {
    q: 'Vero o falso: i telefoni e i Mac non prendono mai virus.',
    answers: ['Falso, ogni dispositivo può essere attaccato', 'Vero, sono immuni', 'Vero, solo i PC prendono virus', 'Vero, se sono nuovi'],
    why: 'Nessun dispositivo è immune: le buone abitudini servono ovunque.'
  },
  {
    q: 'Che cos\'è un backup?',
    answers: ['Una copia di sicurezza dei tuoi file', 'Un virus pericoloso', 'Un tasto per tornare indietro nei giochi', 'Un tipo di password'],
    why: 'Con un backup non perdi foto e file se il dispositivo si rompe o viene attaccato.'
  }
];
