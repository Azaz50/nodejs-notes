import Contact from '../models/contacts.models.js';

export const getContacts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;

        const result = await Contact.paginate({}, { page, limit });
        res.render('home', { 
            totalDocs: result.totalDocs,
            limit: result.limit,
            totalPages: result.totalPages,
            currentPage: result.page,
            counter: result.pagingCounter,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            contacts: result.docs
         })
    } catch (error) {
        res.render('500', { error: error.message })
    }
}

export const getContact = async (req, res) => {
    const contact = await Contact.findById(req.params.id)
    res.render('show-contact', { contact })
}

export const addContactPage = async (req, res) => {
    res.render('add-contact')
}

export const addContact = async (req, res) => {
    await Contact.create(req.body)
    res.redirect('/')
}

export const updateContactPage = async (req, res) => {
    const contact = await Contact.findById(req.params.id)
    res.render('update-contact', { contact })
}

export const updateContact = async (req, res) => {
    await Contact.findByIdAndUpdate(req.params.id, req.body)
    res.redirect('/')
}

export const deleteContact = async (req, res) => {
    await Contact.findByIdAndDelete(req.params.id)
    res.redirect('/')
}
