const Feedback = require('./feedback')
const { Action } = require('../../services/abilities/ability.constants')

const createFeedback = async (req, res) => {
  const feedbackData = req.body
  const feedback = new Feedback(feedbackData)

  if (!req.ability.can(Action.CREATE, feedback)) {
    return res.sendStatus(403)
  }
  try {
    await feedback.save()
    res.json(feedback)
  } catch (e) {
    if (e.name === 'ValidationError') {
      return res.status(400).send({ error: e.message })
    }
    return res.status(500).send({ error: e.message })
  }
}

const listFeedback = async (req, res) => {
  let query
  try {
    query = req.query.q ? JSON.parse(req.query.q) : query
  } catch (e) {
    return res.status(400).send({ error: e.message })
  }

  try {
    const feedback = await Feedback.accessibleBy(req.ability).find(query)
    return res.json(feedback)
  } catch (e) {
    return res.status(500).send({ error: e.message })
  }
}

module.exports = {
  createFeedback,
  listFeedback
}
