import presentation from "../models/presentation.js";

export const getSlides = async (data) => {
  try {
    const { presentationId } = data;
    const pres = await presentation.findById(presentationId)
      .select('slides title')
      .lean();

    if (!pres) throw new Error({ error: 'Presentation not found' });

    return pres.slides;
  } catch (err) {
    throw new Error({ error: err.message });
  }
};

export const addSlide = async (data) => {
  try {
    const { presentationId } = data;

    const pres = await presentation.findById(presentationId);
    if (!pres) throw new Error({ error: 'Presentation not found' });
    const newSlide = { title: 'Untitled Slide', elements: [] };
    pres.slides.push(newSlide);
    await pres.save();
    return pres.slides[pres.slides.length - 1];
  } catch (err) {
    throw new Error({ error: err.message });
  }
};

export const updateSlide = async (data) => {
  try {
    const { presentationId, slideId, title, elements } = data;

    const pres = await presentation.findById(presentationId);
    if (!pres) throw new Error({ error: 'Presentation not found' });

    const slide = pres.slides.id(slideId);
    if (!slide) throw new Error({ error: 'Slide not found' });

    if (title !== undefined) slide.title = title;
    if (elements !== undefined) slide.elements = elements;

    await pres.save();
    return slide;
  } catch (err) {
    throw new Error({ error: err.message });
  }
};

export const deleteSlide = async (data) => {
  try {
    const { presentationId, slideId } = data;
    const pres = await presentation.findById(id);
    if (!pres) throw new Error({ error: 'Presentation not found' });

    const slide = pres.slides.id(slideId);
    if (!slide) throw new Error({ error: 'Slide not found' });

    slide.deleteOne();
    await pres.save();

    return { message: 'Slide deleted successfully' };
  } catch (err) {
    throw new Error({ error: err.message });
  }
};
