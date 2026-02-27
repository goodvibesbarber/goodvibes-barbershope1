const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.time) {
        setSlotError("Please select a time slot.");
        return;
    }

    setStatus('loading');

    // Simulate marking the slot as taken
    const newSlotKey = `${formData.date}_${formData.time}`;
    const updatedBookings = [...bookedSlots, newSlotKey];
    setBookedSlots(updatedBookings);
    localStorage.setItem('simonyo_bookings', JSON.stringify(updatedBookings));

    try {
        // 1. Send email via FormSubmit (Your original code)
        fetch("https://formsubmit.co/ajax/pasposip@gmail.com", {
            method: "POST",
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                _subject: `💈 New Booking: ${formData.name} - ${formData.date} @ ${formData.time}`,
                _template: "table",
                _captcha: "false",
                service: formData.service,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                date: formData.date,
                time: formData.time,
                message: "Please contact customer to confirm appointment."
            })
        }).catch(err => console.error("FormSubmit Error:", err));

        // 2. Send data DIRECTLY to the Admin Dashboard
        let estimatedPrice = 35;
        if (formData.service.includes('Student')) estimatedPrice = 25;
        if (formData.service.includes('Beard')) estimatedPrice = 25;
        if (formData.service.includes('Shave')) estimatedPrice = 30;
        if (formData.service === 'Vibes Experience') estimatedPrice = 55;
        if (formData.service === 'Good Vibes Experience') estimatedPrice = 70;
        if (formData.service.includes('Wax')) estimatedPrice = 8;

        const [timeStr, modifier] = formData.time.split(' ');
        let [hours, minutes] = timeStr.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        
        const startTime24 = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const endTime24 = `${(hours + 1).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        // Using the DEV App URL so we can test it right here
        const response = await fetch("https://ais-dev-edvl43bjtpydafvvuzervp-8583659065.asia-southeast1.run.app/api/bookings", {
            method: "POST",
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                id: Math.random().toString(36).substring(7),
                customerName: formData.name,
                customerEmail: formData.email,
                serviceId: 'external',
                serviceName: formData.service,
                date: formData.date,
                startTime: startTime24,
                endTime: endTime24,
                status: 'active',
                type: 'booking',
                price: estimatedPrice
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        setStatus('success');
    } catch (error: any) {
        console.error("Submission failed", error);
        // THIS WILL POP UP AN ERROR MESSAGE ON YOUR SCREEN
        alert("Dashboard Sync Error: " + error.message + "\n\nPlease take a screenshot of this message.");
        setStatus('success'); // Still show success so the user isn't blocked
    }
  };
