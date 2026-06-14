import { Link, Navigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { LEGAL_DOCUMENTS, type LegalDocId } from "@/lib/legal-content";
import { ArrowLeft } from "lucide-react";

const DOC_IDS: LegalDocId[] = ["privacy", "terms", "agreement"];

function isLegalDocId(id: string): id is LegalDocId {
  return DOC_IDS.includes(id as LegalDocId);
}

export default function LegalDocumentPage() {
  const { docId } = useParams<{ docId: string }>();

  if (!docId || !isLegalDocId(docId)) {
    return <Navigate to="/legal/privacy" replace />;
  }

  const doc = LEGAL_DOCUMENTS[docId];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            На главную
          </Link>
        </Button>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
          {doc.title}
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Обновлено: {doc.updatedAt}
        </p>

        <div className="prose prose-sm sm:prose-base max-w-none space-y-8">
          {doc.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold text-foreground mb-3">
                {section.title}
              </h2>
              {section.paragraphs.map((p, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed mb-3">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t flex flex-wrap gap-3 text-sm">
          {DOC_IDS.filter((id) => id !== docId).map((id) => (
            <Link
              key={id}
              to={`/legal/${id}`}
              className="text-primary font-medium hover:underline"
            >
              {LEGAL_DOCUMENTS[id].title}
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
