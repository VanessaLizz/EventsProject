import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    BrowserQRCodeReader,
} from "@zxing/browser";

import {
    useAuth,
} from "../contexts/authContext.js";

import AccountLogout from "../components/AccountLogout.jsx";

import {
    validateCheckin,
} from "../services/checkinService.js";

import "./CheckinPage.css";

function getResultType(
    message
) {
    const normalized =
        message
            ?.toLowerCase() ||
        "";

    if (
        normalized.includes(
            "já foi utilizado"
        )
    ) {
        return "used";
    }

    if (
        normalized.includes(
            "cancelado"
        )
    ) {
        return "cancelled";
    }

    if (
        normalized.includes(
            "inválido"
        ) ||
        normalized.includes(
            "invalido"
        ) ||
        normalized.includes(
            "não encontrado"
        )
    ) {
        return "invalid";
    }

    return "invalid";
}

function getResultTitle(
    type
) {
    switch (type) {
        case "valid":
            return "Entrada autorizada";

        case "used":
            return "Ingresso já utilizado";

        case "cancelled":
            return "Ingresso cancelado";

        default:
            return "Entrada não autorizada";
    }
}

export default function CheckinPage() {
    const {
        user,
        token,
    } = useAuth();

    const videoRef =
        useRef(null);

    const scannerControlsRef =
        useRef(null);

    const [
        qrToken,
        setQrToken,
    ] = useState("");

    const [
        result,
        setResult,
    ] = useState(null);

    const [
        isLoading,
        setIsLoading,
    ] = useState(false);

    const [
        isCameraActive,
        setIsCameraActive,
    ] = useState(false);

    const [
        cameraError,
        setCameraError,
    ] = useState("");

    const [
        validationMode,
        setValidationMode,
    ] = useState("camera");

    const [
        isProcessingQr,
        setIsProcessingQr,
    ] = useState(false);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    async function validateToken(
        value
    ) {
        const cleanedValue =
            value.trim();

        if (!cleanedValue) {
            setResult({
                type:
                    "invalid",

                title:
                    "QR Code não informado",

                message:
                    "Informe o conteúdo do QR Code para realizar a validação.",
            });

            return;
        }

        setIsLoading(
            true
        );

        setResult(
            null
        );

        try {
            const response =
                await validateCheckin(
                    cleanedValue,
                    token
                );

            setResult({
                type:
                    "valid",

                title:
                    "Entrada autorizada",

                message:
                    response.message ||
                    "Ingresso validado. Entrada autorizada.",

                ticket:
                    response.ticket ||
                    null,
            });

            setQrToken(
                ""
            );
        } catch (error) {
            const message =
                error.message ||
                "Não foi possível validar o ingresso.";

            const type =
                getResultType(
                    message
                );

            setResult({
                type,

                title:
                    getResultTitle(
                        type
                    ),

                message,
            });
        } finally {
            setIsLoading(
                false
            );
        }
    }

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        await validateToken(
            qrToken
        );
    }

    function stopCamera() {
        if (
            scannerControlsRef.current
        ) {
            scannerControlsRef.current.stop();

            scannerControlsRef.current =
                null;
        }

        if (
            videoRef.current
                ?.srcObject
        ) {
            const tracks =
                videoRef.current
                    .srcObject
                    .getTracks();

            tracks.forEach(
                (track) =>
                    track.stop()
            );

            videoRef.current.srcObject =
                null;
        }

        setIsCameraActive(
            false
        );
    }

    async function startCamera() {
        setCameraError(
            ""
        );

        setResult(
            null
        );

        stopCamera();

        try {
            const reader =
                new BrowserQRCodeReader();

            const devices =
                await BrowserQRCodeReader
                    .listVideoInputDevices();

            if (
                devices.length ===
                0
            ) {
                throw new Error(
                    "Nenhuma câmera foi encontrada neste dispositivo."
                );
            }

            const preferredDevice =
                devices[
                    devices.length -
                    1
                ];

            setIsCameraActive(
                true
            );

            const controls =
                await reader
                    .decodeFromVideoDevice(
                        preferredDevice
                            .deviceId,
                        videoRef.current,
                        async (
                            scanResult
                        ) => {
                            if (
                                !scanResult ||
                                isProcessingQr
                            ) {
                                return;
                            }

                            setIsProcessingQr(
                                true
                            );

                            const value =
                                scanResult.getText();

                            stopCamera();

                            await validateToken(
                                value
                            );

                            setIsProcessingQr(
                                false
                            );
                        }
                    );

            scannerControlsRef.current =
                controls;
        } catch (error) {
            stopCamera();

            setCameraError(
                error.message ||
                "Não foi possível acessar a câmera."
            );
        }
    }

    function handleModeChange(
        mode
    ) {
        stopCamera();

        setValidationMode(
            mode
        );

        setResult(
            null
        );

        setCameraError(
            ""
        );
    }

    function handleClear() {
        setQrToken(
            ""
        );

        setResult(
            null
        );

        setCameraError(
            ""
        );
    }

    return (
        <main className="account-page checkin-page">
            <header className="account-heading">
                <p className="account-eyebrow">
                    Controle de acesso
                </p>

                <h1>
                    Área da Portaria
                </h1>

                <p>
                    Olá, {user.name}.
                    Utilize esta área para
                    validar os ingressos na
                    entrada dos eventos.
                </p>

                <AccountLogout />
            </header>

            <section className="checkin-layout">
                <article className="checkin-panel">
                    <div className="checkin-panel-heading">
                        <span className="account-card-number">
                            01
                        </span>

                        <div>
                            <p>
                                Check-in
                            </p>

                            <h2>
                                Validar ingresso
                            </h2>
                        </div>
                    </div>

                    <div className="checkin-mode-selector">
                        <button
                            type="button"
                            className={
                                validationMode ===
                                "camera"
                                    ? "checkin-mode-button active"
                                    : "checkin-mode-button"
                            }
                            onClick={() =>
                                handleModeChange(
                                    "camera"
                                )
                            }
                        >
                            Ler pela câmera
                        </button>

                        <button
                            type="button"
                            className={
                                validationMode ===
                                "manual"
                                    ? "checkin-mode-button active"
                                    : "checkin-mode-button"
                            }
                            onClick={() =>
                                handleModeChange(
                                    "manual"
                                )
                            }
                        >
                            Inserir manualmente
                        </button>
                    </div>

                    {validationMode ===
                    "camera" ? (
                        <div className="checkin-camera-section">
                            <div className="checkin-camera">
                                <video
                                    ref={
                                        videoRef
                                    }
                                    className="checkin-camera-video"
                                />

                                {!isCameraActive && (
                                    <div className="checkin-camera-placeholder">
                                        <div>
                                            <strong>
                                                Leitor de QR Code
                                            </strong>

                                            <p>
                                                Ative a câmera e aponte para o QR Code do ingresso.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {isCameraActive && (
                                    <div className="checkin-camera-frame">
                                        <span className="checkin-camera-corner checkin-camera-corner-1" />
                                        <span className="checkin-camera-corner checkin-camera-corner-2" />
                                        <span className="checkin-camera-corner checkin-camera-corner-3" />
                                        <span className="checkin-camera-corner checkin-camera-corner-4" />
                                    </div>
                                )}
                            </div>

                            {cameraError && (
                                <div
                                    className="checkin-camera-error"
                                    role="alert"
                                >
                                    {
                                        cameraError
                                    }
                                </div>
                            )}

                            {!isCameraActive ? (
                                <button
                                    type="button"
                                    className="checkin-primary-button"
                                    onClick={
                                        startCamera
                                    }
                                    disabled={
                                        isLoading
                                    }
                                >
                                    Ativar câmera
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="checkin-secondary-button checkin-camera-stop"
                                    onClick={
                                        stopCamera
                                    }
                                >
                                    Desativar câmera
                                </button>
                            )}

                            <div className="checkin-tip">
                                <strong>
                                    Leitura automática
                                </strong>

                                <p>
                                    Assim que um QR Code for identificado, a câmera será pausada e o ingresso será validado automaticamente.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="checkin-description">
                                Cole abaixo o token
                                contido no QR Code do
                                ingresso.
                            </p>

                            <form
                                className="checkin-form"
                                onSubmit={
                                    handleSubmit
                                }
                            >
                                <label htmlFor="checkin-token">
                                    Token do QR Code
                                </label>

                                <textarea
                                    id="checkin-token"
                                    value={
                                        qrToken
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setQrToken(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Cole aqui o token lido do QR Code..."
                                    rows="7"
                                    disabled={
                                        isLoading
                                    }
                                />

                                <div className="checkin-form-actions">
                                    <button
                                        type="submit"
                                        className="checkin-primary-button"
                                        disabled={
                                            isLoading
                                        }
                                    >
                                        {isLoading
                                            ? "Validando..."
                                            : "Validar ingresso"}
                                    </button>

                                    <button
                                        type="button"
                                        className="checkin-secondary-button"
                                        onClick={
                                            handleClear
                                        }
                                        disabled={
                                            isLoading
                                        }
                                    >
                                        Limpar
                                    </button>
                                </div>
                            </form>

                            <div className="checkin-tip">
                                <strong>
                                    Importante
                                </strong>

                                <p>
                                    Um ingresso válido
                                    pode ser utilizado
                                    apenas uma vez.
                                </p>
                            </div>
                        </>
                    )}
                </article>

                <article className="checkin-result-panel">
                    <div className="checkin-panel-heading">
                        <span className="account-card-number">
                            02
                        </span>

                        <div>
                            <p>
                                Resultado
                            </p>

                            <h2>
                                Status da validação
                            </h2>
                        </div>
                    </div>

                    {!result ? (
                        <div className="checkin-result-empty">
                            <div className="checkin-result-empty-icon">
                                ?
                            </div>

                            <h3>
                                Aguardando leitura
                            </h3>

                            <p>
                                O resultado da
                                validação aparecerá
                                aqui.
                            </p>
                        </div>
                    ) : (
                        <div
                            className={`checkin-result checkin-result-${result.type}`}
                        >
                            <div className="checkin-result-icon">
                                {result.type ===
                                "valid"
                                    ? "✓"
                                    : result.type ===
                                      "used"
                                    ? "!"
                                    : "×"}
                            </div>

                            <div className="checkin-result-heading">
                                <p>
                                    {result.type ===
                                    "valid"
                                        ? "VÁLIDO"
                                        : result.type ===
                                          "used"
                                        ? "JÁ UTILIZADO"
                                        : result.type ===
                                          "cancelled"
                                        ? "CANCELADO"
                                        : "INVÁLIDO"}
                                </p>

                                <h3>
                                    {
                                        result.title
                                    }
                                </h3>

                                <span>
                                    {
                                        result.message
                                    }
                                </span>
                            </div>

                            {result.ticket && (
                                <dl className="checkin-ticket-details">
                                    {result.ticket
                                        .event
                                        ?.title && (
                                        <div>
                                            <dt>
                                                Evento
                                            </dt>

                                            <dd>
                                                {
                                                    result
                                                        .ticket
                                                        .event
                                                        .title
                                                }
                                            </dd>
                                        </div>
                                    )}

                                    {result.ticket
                                        .sector && (
                                        <div>
                                            <dt>
                                                Setor
                                            </dt>

                                            <dd>
                                                {
                                                    result
                                                        .ticket
                                                        .sector
                                                }
                                            </dd>
                                        </div>
                                    )}

                                    {result.ticket
                                        .modality && (
                                        <div>
                                            <dt>
                                                Modalidade
                                            </dt>

                                            <dd>
                                                {
                                                    result
                                                        .ticket
                                                        .modality
                                                }
                                            </dd>
                                        </div>
                                    )}

                                    {result.ticket
                                        .priceCategory && (
                                        <div>
                                            <dt>
                                                Categoria
                                            </dt>

                                            <dd>
                                                {
                                                    result
                                                        .ticket
                                                        .priceCategory
                                                }
                                            </dd>
                                        </div>
                                    )}

                                    {result.ticket
                                        .seat && (
                                        <div>
                                            <dt>
                                                Assento
                                            </dt>

                                            <dd>
                                                {
                                                    result
                                                        .ticket
                                                        .seat
                                                        .label
                                                }
                                            </dd>
                                        </div>
                                    )}

                                    {result.ticket
                                        .id && (
                                        <div>
                                            <dt>
                                                Ingresso
                                            </dt>

                                            <dd>
                                                {
                                                    result
                                                        .ticket
                                                        .id
                                                }
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            )}

                            <button
                                type="button"
                                className="checkin-new-validation"
                                onClick={() => {
                                    handleClear();

                                    if (
                                        validationMode ===
                                        "camera"
                                    ) {
                                        startCamera();
                                    }
                                }}
                            >
                                Validar outro ingresso
                            </button>
                        </div>
                    )}
                </article>
            </section>
        </main>
    );
}