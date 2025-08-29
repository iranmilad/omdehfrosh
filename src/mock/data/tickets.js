export const tickets = [
    {
        "userId": 2,
        "tickets": [
            {
                "requesterId": 2,
                "requesterName": "علی محمدی",
                "ticketId": 'ticket1',
                "priority": "high",
                "ticketTitle": "حل مشکل سایت",
                "team": "technical_support",
                "teamName": "پشتیبانی فنی",
                "ticketDescription": "مشکل در بارگذاری صفحه اصلی",
                "messages": [
                    { 
                        "sender": 
                            { 
                                "role": "user", 
                                "userId": 2, 
                                "name": "علی محمدی"
                            }, 
                        "message": "سلام، مشکل دارم",
                        "file": "https://example.com/image.jpg"
                    },
                    { 
                        "sender": 
                            { 
                                "role": "support", 
                                "userId": 1001, 
                                "name": "سارا حسینی"
                            }, 
                        "message": "سلام، چطور می‌توانم کمک کنم؟",
                        "file": "https://example.com/image.zip"

                    },
                    { 
                        "sender": 
                            { 
                                "role": "user", 
                                "userId": 2, 
                                "name": "علی محمدی"
                            }, 
                        "message": "صفحه اصلی بارگذاری نمی‌شود",
                        "file": ""
                    }
                ],
                "ticketStatus": "open",
                "createdAt": "1403/02/02",
                "updatedAt":"1403/02/02"
            },
            {
                "ticketId": 'ticket2',
                "requesterId": 2,
                "requesterName": "علی محمدی",
                "ticketId": 'ticket2',
                "priority": "high",
                "ticketTitle": "مشکل در پرداخت",
                "team": "technical_support",
                "teamName": "پشتیبانی فنی",
                "ticketDescription": "پرداخت ناموفق در مرحله نهایی",
                "messages": [
                    { 
                        "sender": 
                            { 
                                "role": "user", 
                                "userId": 2, 
                                "name": "علی محمدی"
                            }, 
                        "message": "سلام، مشکل دارم",
                        "file": "" 
                    },
                    { 
                        "sender": 
                            { 
                                "role": "support", 
                                "userId": 1001, 
                                "name": "سارا حسینی"
                            }, 
                        "message": "سلام، چطور می‌توانم کمک کنم؟",
                        "file": "" 
                    },
                    { 
                        "sender": 
                            { 
                                "role": "user", 
                                "userId": 2, 
                                "name": "علی محمدی"
                            }, 
                        "message": "صفحه اصلی بارگذاری نمی‌شود",
                        "file": "" 
                    }
                ],
                "ticketStatus": "closed",
                "createdAt":"1403/02/02",
                "updatedAt":"1403/02/02"
            }
        ]
    }

]