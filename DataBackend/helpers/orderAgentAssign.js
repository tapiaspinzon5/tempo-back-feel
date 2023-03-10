exports.orderAssign = (result) => {
  let rows = [];
  let rows2 = [];

  // Agrupamos por learningPlan
  result.forEach((e) => {
    // Si existe el LP solo inserta el curso
    if (rows[e.idLp]) {
      rows[e.idLp].courses.push({
        idCourse: e.idCourse,
        nameCourse: e.nameCourse,
        isPrivate: e.isPrivate,
        urlImgCourse: e.urlImgCourse,
        orderCourse: e.orderCourse,
        statusCourse: e.StatusCourse,
        descriptionCourse: e.descriptionCourse,
        advanceAgent: e.advanceAgent,
        progressLastCourse: e?.progressLastCourse,
      });
    }

    // Si no existe el LP, lo crea por 1a vez
    if (!rows[e.idLp]) {
      rows[e.idLp] = {
        idLp: e.idLp,
        nameLearningPlan: e.nameLearningPlan,
        descriptionLearningPlan: e.descriptionLearningPlan,
        statusLp: e.StatusLp,
        advanceLp: e.advanceLp,
        ViewsLp: e?.ViewsLp,
        ViewsA: e?.ViewsA,
        ViewsC: e?.ViewsC,
        agent: e.Agent,
        idEmployee: e.idEmployee,
        courses: [
          {
            idCourse: e.idCourse,
            nameCourse: e.nameCourse,
            isPrivate: e.isPrivate,
            urlImgCourse: e.urlImgCourse,
            orderCourse: e.orderCourse,
            statusCourse: e.StatusCourse,
            descriptionCourse: e.descriptionCourse,
            advanceAgent: e.advanceAgent,
            progressLastCourse: e?.progressLastCourse,
          },
        ],
      };
    }
  });

  // removemos los null del array
  rows.forEach((el) => {
    rows2.push(el);
  });

  let learningPlanWcoursesOrdered = rows2.map((lp) => {
    // Ordenamos las actividades por la columna orderActivity
    let sortedCourses = lp.courses.sort((r1, r2) =>
      r1.orderCourse > r2.orderCourse
        ? 1
        : r1.orderCourse < r2.orderCourse
        ? -1
        : 0
    );

    lp.courses = sortedCourses;
    return lp;
  });

  return learningPlanWcoursesOrdered;
};
